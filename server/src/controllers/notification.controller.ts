import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { broadcastNotificationUpdate } from '../socket';

// Get all notifications for current user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    await prisma.notification.deleteMany({
      where: {
        userId,
        read: true
      }
    });

    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    console.error('Delete all read error:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
};

// Helper function to create notification (used internally)
export const createNotificationHelper = async (
  userId: number,
  type: string,
  title: string,
  text: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        text,
        read: false
      }
    });

    // Broadcast to user via socket
    broadcastNotificationUpdate(userId, 'create', notification);

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Bulk create notifications for multiple users
export const createBulkNotifications = async (
  userIds: number[],
  type: string,
  title: string,
  text: string
) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            type,
            title,
            text,
            read: false
          }
        })
      )
    );

    // Broadcast to all users
    notifications.forEach(notif => {
      broadcastNotificationUpdate(notif.userId, 'create', notif);
    });

    return notifications;
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    return [];
  }
};
