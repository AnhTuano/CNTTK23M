// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Use temp directory for serverless environments (Vercel)
const BACKUP_DIR = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'backups')
  : path.join(__dirname, '../../backups');

// Lazy initialization: create backup directory only when needed
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

// Create a full database backup
export const createBackup = async (req: Request, res: Response) => {
  try {
    ensureBackupDir(); // Create directory only when creating backup
    
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.name;

    // console.log('🔄 Starting backup creation...');

    // Fetch all data from database with proper error handling
    let users, posts, documents, memories, chatRooms, chatMessages, notifications, badges, reports, websiteConfig;

    try {
      // console.log('📊 Fetching users...');
      users = await prisma.user.findMany({
        include: {
          badges: true,
        }
      });
      // console.log(`✓ Found ${users.length} users`);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching posts...');
      posts = await prisma.post.findMany({
        include: {
          comments: true,
          votes: true,
          poll: {
            include: {
              options: {
                include: {
                  votes: true
                }
              }
            }
          }
        }
      });
      // console.log(`✓ Found ${posts.length} posts`);
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching documents...');
      documents = await prisma.document.findMany({
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });
      // console.log(`✓ Found ${documents.length} documents`);
    } catch (err) {
      console.error('Error fetching documents:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching memories...');
      memories = await prisma.memory.findMany({
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          reactions: true
        }
      });
      // console.log(`✓ Found ${memories.length} memories`);
    } catch (err) {
      console.error('Error fetching memories:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching chat rooms...');
      chatRooms = await prisma.chatRoom.findMany({
        include: {
          members: true,
          allowedRoles: true
        }
      });
      // console.log(`✓ Found ${chatRooms.length} chat rooms`);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching chat messages...');
      chatMessages = await prisma.chatMessage.findMany();
      // console.log(`✓ Found ${chatMessages.length} messages`);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching notifications...');
      notifications = await prisma.notification.findMany();
      // console.log(`✓ Found ${notifications.length} notifications`);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching badges...');
      badges = await prisma.badge.findMany();
      // console.log(`✓ Found ${badges.length} badges`);
    } catch (err) {
      console.error('Error fetching badges:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching reports...');
      reports = await prisma.report.findMany({
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          post: true
        }
      });
      // console.log(`✓ Found ${reports.length} reports`);
    } catch (err) {
      console.error('Error fetching reports:', err);
      throw err;
    }

    try {
      // console.log('📊 Fetching website config...');
      websiteConfig = await prisma.websiteConfig.findFirst();
      // console.log(`✓ Found config`);
    } catch (err) {
      console.error('Error fetching website config:', err);
      throw err;
    }

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      createdBy: {
        id: userId,
        name: userName
      },
      data: {
        users,
        posts,
        documents,
        memories,
        chatRooms,
        chatMessages,
        notifications,
        badges,
        reports,
        websiteConfig
      },
      stats: {
        usersCount: users.length,
        postsCount: posts.length,
        documentsCount: documents.length,
        memoriesCount: memories.length,
        chatRoomsCount: chatRooms.length,
        messagesCount: chatMessages.length
      }
    };

    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // console.log('💾 Writing backup file...');
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // Log backup creation
    // console.log(`✅ Backup created: ${filename} by ${userName}`);

    res.json({
      success: true,
      filename,
      timestamp: backupData.timestamp,
      stats: backupData.stats,
      message: 'Backup created successfully'
    });

  } catch (error) {
    console.error('❌ Backup creation error:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    res.status(500).json({ 
      error: 'Failed to create backup',
      details: (error as Error).message 
    });
  }
};

// Download a backup file
export const downloadBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Security: validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(filepath, filename);
  } catch (error) {
    console.error('Backup download error:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
};

// List all backups
export const listBackups = async (req: Request, res: Response) => {
  try {
    ensureBackupDir(); // Create directory if not exists
    
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(f => f.endsWith('.json') && f.startsWith('backup_'))
      .map(filename => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filepath);
        
        // Try to read metadata from file
        try {
          const content = fs.readFileSync(filepath, 'utf-8');
          const data = JSON.parse(content);
          
          return {
            filename,
            size: stats.size,
            created: stats.mtime,
            version: data.version,
            timestamp: data.timestamp,
            createdBy: data.createdBy,
            stats: data.stats
          };
        } catch {
          return {
            filename,
            size: stats.size,
            created: stats.mtime
          };
        }
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json(backups);
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
};

// Restore from backup
export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { backupData } = req.body;
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.name;

    if (!backupData || !backupData.data) {
      return res.status(400).json({ error: 'Invalid backup data' });
    }

    // console.log(`⚠️  Starting restore by ${userName}...`);

    // Begin transaction
    await prisma.$transaction(async (tx) => {
      const data = backupData.data;

      // Delete existing data (in reverse order of dependencies)
      await tx.chatMessage.deleteMany({});
      await tx.chatRoomRole.deleteMany({});
      await tx.chatRoomMember.deleteMany({});
      await tx.chatRoom.deleteMany({});
      
      await tx.memoryReaction.deleteMany({});
      await tx.memory.deleteMany({});
      
      await tx.report.deleteMany({});
      
      await tx.pollVote.deleteMany({});
      await tx.pollOption.deleteMany({});
      await tx.poll.deleteMany({});
      await tx.comment.deleteMany({});
      await tx.postVote.deleteMany({});
      await tx.post.deleteMany({});
      
      await tx.document.deleteMany({});
      
      await tx.notification.deleteMany({});
      await tx.userBadge.deleteMany({});
      await tx.badge.deleteMany({});
      
      await tx.user.deleteMany({});
      await tx.websiteConfig.deleteMany({});

      // Restore users
      if (data.users && data.users.length > 0) {
        for (const user of data.users) {
          await tx.user.create({
            data: {
              id: user.id,
              email: user.email,
              password: user.password,
              name: user.name,
              avatar: user.avatar,
              role: user.role,
              points: user.points || 0,
              posts: user.posts || 0,
              documents: user.documents || 0,
              comments: user.comments || 0,
              bio: user.bio,
              studentId: user.studentId,
              dateOfBirth: user.dateOfBirth,
              phone: user.phone,
              github: user.github,
              facebook: user.facebook
            }
          });
        }
      }

      // Restore website config
      if (data.websiteConfig) {
        await tx.websiteConfig.create({
          data: {
            id: data.websiteConfig.id,
            className: data.websiteConfig.className,
            slogan: data.websiteConfig.slogan,
            coverImage: data.websiteConfig.coverImage,
            websiteName: data.websiteConfig.websiteName,
            websiteTitle: data.websiteConfig.websiteTitle,
            isMaintenanceMode: data.websiteConfig.isMaintenanceMode,
            bannerText: data.websiteConfig.bannerText,
            bannerType: data.websiteConfig.bannerType,
            bannerIsActive: data.websiteConfig.bannerIsActive
          }
        });
      }

      // Restore posts
      if (data.posts && data.posts.length > 0) {
        for (const post of data.posts) {
          await tx.post.create({
            data: {
              id: post.id,
              title: post.title,
              content: post.content,
              imageUrl: post.imageUrl,
              category: post.category,
              pinned: post.pinned,
              authorId: post.authorId,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt
            }
          });

          // Restore comments
          if (post.comments && post.comments.length > 0) {
            for (const comment of post.comments) {
              await tx.comment.create({
                data: {
                  id: comment.id,
                  content: comment.content,
                  authorId: comment.authorId,
                  postId: comment.postId,
                  createdAt: comment.createdAt
                }
              });
            }
          }

          // Restore votes
          if (post.upvotedBy && post.upvotedBy.length > 0) {
            for (const vote of post.upvotedBy) {
              await tx.postVote.create({
                data: {
                  userId: vote.userId,
                  postId: vote.postId,
                  type: 'UP'
                }
              });
            }
          }

          if (post.downvotedBy && post.downvotedBy.length > 0) {
            for (const vote of post.downvotedBy) {
              await tx.postVote.create({
                data: {
                  userId: vote.userId,
                  postId: vote.postId,
                  type: 'DOWN'
                }
              });
            }
          }

          // Restore poll
          if (post.poll) {
            const poll = await tx.poll.create({
              data: {
                id: post.poll.id,
                question: post.poll.question,
                postId: post.poll.postId,
                endsAt: post.poll.endsAt
              }
            });

            if (post.poll.options && post.poll.options.length > 0) {
              for (const option of post.poll.options) {
                await tx.pollOption.create({
                  data: {
                    id: option.id,
                    text: option.text,
                    pollId: poll.id
                  }
                });

                if (option.voters && option.voters.length > 0) {
                  for (const vote of option.voters) {
                    await tx.pollVote.create({
                      data: {
                        userId: vote.userId,
                        optionId: vote.optionId
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }

      // Restore documents
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await tx.document.create({
            data: {
              id: doc.id,
              url: doc.url,
              title: doc.title,
              type: doc.type,
              description: doc.description,
              status: doc.status,
              uploaderId: doc.uploaderId,
              uploadedAt: doc.uploadedAt
            }
          });
        }
      }

      // Restore memories
      if (data.memories && data.memories.length > 0) {
        for (const memory of data.memories) {
          await tx.memory.create({
            data: {
              id: memory.id,
              url: memory.url,
              thumbnail: memory.thumbnail,
              semester: memory.semester,
              status: memory.status,
              uploaderId: memory.uploaderId,
              createdAt: memory.createdAt
            }
          });

          if (memory.reactions && memory.reactions.length > 0) {
            for (const reaction of memory.reactions) {
              await tx.memoryReaction.create({
                data: {
                  userId: reaction.userId,
                  memoryId: reaction.memoryId,
                  emoji: reaction.emoji
                }
              });
            }
          }
        }
      }

      // Restore chat rooms
      if (data.chatRooms && data.chatRooms.length > 0) {
        for (const room of data.chatRooms) {
          await tx.chatRoom.create({
            data: {
              id: room.id,
              name: room.name,
              description: room.description,
              type: room.type,
              createdById: room.createdById,
              createdAt: room.createdAt
            }
          });

          if (room.members && room.members.length > 0) {
            for (const member of room.members) {
              await tx.chatRoomMember.create({
                data: {
                  userId: member.userId,
                  roomId: member.roomId,
                  joinedAt: member.joinedAt
                }
              });
            }
          }

          if (room.roles && room.roles.length > 0) {
            for (const role of room.roles) {
              await tx.chatRoomRole.create({
                data: {
                  userId: role.userId,
                  roomId: role.roomId,
                  role: role.role
                }
              });
            }
          }
        }
      }

      // Restore chat messages
      if (data.chatMessages && data.chatMessages.length > 0) {
        for (const message of data.chatMessages) {
          await tx.chatMessage.create({
            data: {
              id: message.id,
              content: message.content,
              roomId: message.roomId,
              userId: message.userId,
              createdAt: message.createdAt
            }
          });
        }
      }

      // Restore badges
      if (data.badges && data.badges.length > 0) {
        for (const badge of data.badges) {
          await tx.badge.create({
            data: {
              id: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              color: badge.color
            }
          });
        }
      }

      // Restore notifications
      if (data.notifications && data.notifications.length > 0) {
        for (const notif of data.notifications) {
          await tx.notification.create({
            data: {
              id: notif.id,
              userId: notif.userId,
              type: notif.type,
              title: notif.title,
              text: notif.text,
              read: notif.read,
              createdAt: notif.createdAt
            }
          });
        }
      }

      // Restore reports
      if (data.reports && data.reports.length > 0) {
        for (const report of data.reports) {
          await tx.report.create({
            data: {
              id: report.id,
              reason: report.reason,
              description: report.description,
              status: report.status,
              postId: report.postId,
              reporterId: report.reporterId,
              createdAt: report.createdAt
            }
          });
        }
      }
    });

    // console.log(`✅ Restore completed successfully by ${userName}`);

    res.json({
      success: true,
      message: 'Database restored successfully',
      restoredBy: userName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ 
      error: 'Failed to restore backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a backup file
export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Security: validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    fs.unlinkSync(filepath);
    
    res.json({ 
      success: true, 
      message: 'Backup deleted successfully',
      filename 
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
};
