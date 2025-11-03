import express from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as badgeController from '../controllers/badge.controller';
import * as autoBadgeController from '../controllers/auto-badge.controller';

const router = express.Router();

// Get all badges (public)
router.get('/', badgeController.getAllBadges);

// Get single badge (public)
router.get('/:id', badgeController.getBadge);

// Create new badge (Committee only)
router.post('/', authenticate, isCommittee, badgeController.createBadge);

// Update badge (Committee only)
router.put('/:id', authenticate, isCommittee, badgeController.updateBadge);

// Delete badge (Committee only)
router.delete('/:id', authenticate, isCommittee, badgeController.deleteBadge);

// Seed default badges (Committee only)
router.post('/seed-defaults', authenticate, isCommittee, badgeController.seedDefaultBadges);

// Auto-award badges for a user (authenticated)
router.post('/auto-award/:userId', authenticate, autoBadgeController.checkAndAwardBadges);

// Check and award badges for all users (Committee only)
router.post('/auto-award-all', authenticate, isCommittee, autoBadgeController.checkAllUsers);

export default router;
