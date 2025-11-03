import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// Get all users
router.get('/', authenticate, userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Update user
router.put('/:id', authenticate, userController.updateUser);

// Update user role (Committee only)
router.patch('/:id/role', authenticate, isCommittee, userController.updateUserRole);

// Lock/Unlock user (Committee only)
router.post('/:id/lock', authenticate, isCommittee, userController.toggleLockUser);

// Add badge to user (Committee only)
router.post('/:id/badges', authenticate, isCommittee, userController.addBadgeToUser);

// Remove badge from user (Committee only)
router.delete('/:id/badges/:badgeId', authenticate, isCommittee, userController.removeBadgeFromUser);

// Get user stats
router.get('/:id/stats', authenticate, userController.getUserStats);

// Sync user points
router.post('/:id/sync-points', authenticate, userController.syncUserPoints);

// Sync all users' points (Committee only)
router.post('/sync-all-points', authenticate, isCommittee, userController.syncAllUsersPoints);

export default router;
