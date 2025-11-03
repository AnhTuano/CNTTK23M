import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { broadcastPostUpdate, broadcastCommentUpdate, broadcastVoteUpdate } from '../socket';
import { createBulkNotifications, createNotificationHelper } from './notification.controller';
import { BadgeAutoAwardService } from '../services/badge-auto-award.service';
import { updateUserPoints } from '../services/points.service';

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        poll: {
          include: {
            options: {
              include: {
                votes: true
              }
            }
          }
        },
        votes: true,
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        poll: {
          include: {
            options: {
              include: {
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        votes: true
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, imageUrl, category, pollQuestion, pollOptions } = req.body;
    const userId = (req as any).user?.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        category: category || 'general',
        authorId: userId,
        poll: pollQuestion && pollOptions ? {
          create: {
            question: pollQuestion,
            options: {
              create: pollOptions.map((option: string) => ({
                text: option
              }))
            }
          }
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        poll: {
          include: {
            options: true
          }
        }
      }
    });

    // Broadcast to all clients
    broadcastPostUpdate('create', post);

    // Send notifications to all users except the author
    const allUsers = await prisma.user.findMany({
      where: { 
        id: { not: userId },
        locked: false 
      },
      select: { id: true }
    });
    
    await createBulkNotifications(
      allUsers.map(u => u.id),
      'post',
      'Bài viết mới',
      `${post.author.name} vừa đăng: ${post.title}`
    );

    // Update user points immediately
    updateUserPoints(userId).catch(err => 
      console.error('Failed to update user points:', err)
    );

    // Auto-check and award badges for the author
    BadgeAutoAwardService.checkAndAwardUser(userId).catch(err => 
      console.error('Failed to auto-award badges:', err)
    );

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        imageUrl
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Broadcast update
    broadcastPostUpdate('update', post);

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    // Get post author before deletion
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    await prisma.post.delete({
      where: { id: postId }
    });

    // Broadcast delete
    broadcastPostUpdate('delete', { id: postId });

    // Update author's points after deleting their post
    if (post?.authorId) {
      updateUserPoints(post.authorId).catch(err => 
        console.error('Failed to update user points:', err)
      );
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Vote on post
export const votePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isUpvote } = req.body;
    const userId = (req as any).user?.id;

    const existingVote = await prisma.postVote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: parseInt(id)
        }
      }
    });

    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        // Remove vote if same
        await prisma.postVote.delete({
          where: {
            userId_postId: {
              userId,
              postId: parseInt(id)
            }
          }
        });
      } else {
        // Update vote if different
        await prisma.postVote.update({
          where: {
            userId_postId: {
              userId,
              postId: parseInt(id)
            }
          },
          data: { isUpvote }
        });
      }
    } else {
      // Create new vote
      await prisma.postVote.create({
        data: {
          userId,
          postId: parseInt(id),
          isUpvote
        }
      });
    }

    // Get updated votes and broadcast
    const votes = await prisma.postVote.findMany({
      where: { postId: parseInt(id) }
    });
    broadcastVoteUpdate(parseInt(id), votes);

    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
};

// Toggle pin post
export const togglePinPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { pinned: !post.pinned }
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
};

// Add comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(id),
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Broadcast comment creation
    broadcastCommentUpdate('create', parseInt(id), comment);

    // Notify post author if commenter is not the author
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: { authorId: true, title: true }
    });
    
    if (post && post.authorId !== userId) {
      await createNotificationHelper(
        post.authorId,
        'comment',
        'Bình luận mới',
        `${comment.author.name} đã bình luận vào bài viết "${post.title}"`
      );
    }

    // Update commenter's points immediately
    updateUserPoints(userId).catch(err => 
      console.error('Failed to update user points:', err)
    );

    // Auto-check and award badges for the commenter
    BadgeAutoAwardService.checkAndAwardUser(userId).catch(err => 
      console.error('Failed to auto-award badges:', err)
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;

    // Get comment author before deletion
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { authorId: true }
    });

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    // Broadcast comment deletion
    broadcastCommentUpdate('delete', parseInt(id));

    // Update author's points after deleting their comment
    if (comment?.authorId) {
      updateUserPoints(comment.authorId).catch(err => 
        console.error('Failed to update user points:', err)
      );
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
