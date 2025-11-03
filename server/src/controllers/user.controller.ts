import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { broadcastUserUpdate } from '../socket';
import { createNotificationHelper } from './notification.controller';
import { updateUserPoints, updateAllUserPoints } from '../services/points.service';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        coverImage: true,
        role: true,
        bio: true,
        major: true,
        birthday: true,
        phone: true,
        facebookUrl: true,
        githubUrl: true,
        points: true,
        locked: true,
        createdAt: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            posts: true,
            documents: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to include counts as direct properties
    const usersWithCounts = users.map(user => ({
      ...user,
      joinDate: user.createdAt.toISOString(),
      posts: user._count.posts,
      documents: user._count.documents,
      comments: user._count.comments,
      badges: user.badges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        color: ub.badge.color,
        awardedAt: ub.awardedAt
      })),
      _count: undefined // Remove _count from response
    }));

    res.json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        badges: {
          include: {
            badge: true
          }
        },
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            documents: true,
            memories: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Users can only update their own profile unless they're admin
    if (parseInt(id) !== userId && (req as any).user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, bio, major, birthday, phone, facebookUrl, githubUrl, avatar, coverImage } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        bio,
        major,
        birthday,
        phone,
        facebookUrl,
        githubUrl,
        avatar,
        coverImage
      }
    });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Update user role (Committee only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Validate role enum - include all possible roles
    const validRoles = [
      'ThanhVien', 
      'LopTruong', 
      'LopPhoHocTap', 
      'LopPhoDoiSong', 
      'BiThu', 
      'PhoBiThu',
      'UyVien',
      'Admin'
    ];
    
    if (!validRoles.includes(role)) {
      console.error('Invalid role received:', role);
      return res.status(400).json({ error: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}` });
    }

    console.log(`Updating user ${id} to role: ${role}`);
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });

    console.log('User updated successfully:', user);

    const { password, ...userWithoutPassword } = user;
    
    // Broadcast user update
    broadcastUserUpdate('update', userWithoutPassword);
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to update user role - Full error:', error);
    console.error('Error name:', (error as any).name);
    console.error('Error message:', (error as any).message);
    res.status(500).json({ 
      error: 'Failed to update user role',
      details: (error as any).message 
    });
  }
};

// Toggle lock user (Committee only)
export const toggleLockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { locked: !user.locked }
    });

    // Broadcast user update to all clients
    const { password, ...userWithoutPassword } = updatedUser;
    broadcastUserUpdate('update', userWithoutPassword);

    // If locking the user, send notification
    if (updatedUser.locked) {
      await createNotificationHelper(
        updatedUser.id,
        'system',
        '⚠️ Tài khoản bị khoá',
        'Tài khoản của bạn đã bị khoá bởi quản trị viên. Vui lòng liên hệ để biết thêm chi tiết.'
      );
    }

    console.log(`✅ User ${updatedUser.id} lock status: ${updatedUser.locked}`);
    res.json(userWithoutPassword); // Return user object directly
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle user lock' });
  }
};

// Add badge to user (Committee only)
export const addBadgeToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { badgeId } = req.body;

    const userBadge = await prisma.userBadge.create({
      data: {
        userId: parseInt(id),
        badgeId
      },
      include: {
        badge: true
      }
    });

    res.json(userBadge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add badge' });
  }
};

// Remove badge from user (Committee only)
export const removeBadgeFromUser = async (req: Request, res: Response) => {
  try {
    const { id, badgeId } = req.params;

    await prisma.userBadge.delete({
      where: {
        userId_badgeId: {
          userId: parseInt(id),
          badgeId
        }
      }
    });

    res.json({ message: 'Badge removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove badge' });
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        points: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            documents: true,
            memories: true,
            badges: true,
            attendances: true
          }
        }
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

// Sync user points (recalculate based on activities)
export const syncUserPoints = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await updateUserPoints(parseInt(id));
    res.json({ message: 'Points synced successfully' });
  } catch (error) {
    console.error('Sync user points error:', error);
    res.status(500).json({ error: 'Failed to sync user points' });
  }
};

// Sync all users' points (admin only)
export const syncAllUsersPoints = async (req: Request, res: Response) => {
  try {
    await updateAllUserPoints();
    res.json({ message: 'All user points synced successfully' });
  } catch (error) {
    console.error('Sync all users points error:', error);
    res.status(500).json({ error: 'Failed to sync all users points' });
  }
};
