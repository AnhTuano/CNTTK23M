import prisma from '../lib/prisma';
import { broadcastUserUpdate } from '../socket';

/**
 * Calculate points for a user based on their activities
 * - Posts: 10 points each
 * - Documents (approved): 15 points each
 * - Comments: 5 points each
 */
export const calculateUserPoints = async (userId: number): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          documents: { where: { status: 'DaDuyet' } }, // Only approved documents
          comments: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const postsPoints = user._count.posts * 10;
  const documentsPoints = user._count.documents * 15;
  const commentsPoints = user._count.comments * 5;
  const totalPoints = postsPoints + documentsPoints + commentsPoints;

  return totalPoints;
};

/**
 * Update user's points in database and broadcast to all clients
 */
export const updateUserPoints = async (userId: number): Promise<void> => {
  try {
    const calculatedPoints = await calculateUserPoints(userId);

    // Update points in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { points: calculatedPoints },
      include: {
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    // Get counts for frontend display
    const counts = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            documents: { where: { status: 'DaDuyet' } },
            comments: true
          }
        }
      }
    });

    // Broadcast update to all connected clients
    const userForBroadcast = {
      ...updatedUser,
      posts: counts?._count.posts || 0,
      documents: counts?._count.documents || 0,
      comments: counts?._count.comments || 0,
      badges: updatedUser.badges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        color: ub.badge.color,
        awardedAt: ub.awardedAt
      }))
    };

    broadcastUserUpdate('update', userForBroadcast);

    console.log(`✅ Updated points for user ${userId}: ${calculatedPoints} points`);
  } catch (error) {
    console.error(`❌ Failed to update points for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Recalculate points for all users (use sparingly - expensive operation)
 */
export const updateAllUserPoints = async (): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    console.log(`🔄 Updating points for ${users.length} users...`);

    for (const user of users) {
      await updateUserPoints(user.id);
    }

    console.log(`✅ Finished updating points for all users`);
  } catch (error) {
    console.error('❌ Failed to update all user points:', error);
    throw error;
  }
};
