import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as postController from '../controllers/post.controller';

const router = Router();

// Get all posts
router.get('/', postController.getAllPosts);

// Get post by ID
router.get('/:id', postController.getPostById);

// Create post (Committee only)
router.post('/', authenticate, isCommittee, postController.createPost);

// Update post (Committee only)
router.put('/:id', authenticate, isCommittee, postController.updatePost);

// Delete post (Committee only)
router.delete('/:id', authenticate, isCommittee, postController.deletePost);

// Vote on post
router.post('/:id/vote', authenticate, postController.votePost);

// Pin/Unpin post (Committee only)
router.post('/:id/pin', authenticate, isCommittee, postController.togglePinPost);

// Add comment
router.post('/:id/comments', authenticate, postController.addComment);

// Delete comment
router.delete('/:id/comments/:commentId', authenticate, postController.deleteComment);

export default router;
