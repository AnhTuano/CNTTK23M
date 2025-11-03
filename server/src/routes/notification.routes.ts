import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// Get user notifications
router.get('/', authenticate, notificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.put('/read/all', authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', authenticate, notificationController.deleteAllRead);

export default router;
