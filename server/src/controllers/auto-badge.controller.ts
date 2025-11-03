import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Auto-award badges based on user's activity points
export const checkAndAwardBadges = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user with their current badges
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
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
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate category points
    const postsPoints = user._count.posts * 10;
    const documentsPoints = user._count.documents * 15;
    const commentsPoints = user._count.comments * 5;
    const totalPoints = postsPoints + documentsPoints + commentsPoints;

    // Get all badges with requirements
    const allBadges = await prisma.badge.findMany();

    // Find badges that user qualifies for but doesn't have yet
    const currentBadgeIds = user.badges.map(ub => ub.badgeId);
    const newBadges = [];

    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (currentBadgeIds.includes(badge.id)) {
        continue;
      }

      // Skip if no points requirement
      const requiredPoints = (badge as any).requiredPoints;
      if (!requiredPoints || requiredPoints <= 0) {
        continue;
      }

      // Calculate points based on badge category
      let categoryPoints = 0;
      const category = (badge as any).category;
      switch (category) {
        case 'posts':
          categoryPoints = postsPoints;
          break;
        case 'documents':
          categoryPoints = documentsPoints;
          break;
        case 'comments':
          categoryPoints = commentsPoints;
          break;
        case 'all':
        default:
          categoryPoints = totalPoints;
          break;
      }

      // Check if user meets the requirement
      if (categoryPoints >= requiredPoints) {
        // Award the badge
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id
          }
        });
        newBadges.push(badge);
      }
    }

    res.json({
      message: `Awarded ${newBadges.length} new badge(s)`,
      newBadges
    });
  } catch (error) {
    console.error('Failed to check and award badges:', error);
    res.status(500).json({ error: 'Failed to check and award badges' });
  }
};

// Bulk check all users (for admin use)
export const checkAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            documents: true,
            comments: true
          }
        }
      }
    });

    let totalAwarded = 0;

    for (const user of users) {
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/badges/auto-award/${user.id}`, {
        headers: {
          'Authorization': req.headers.authorization || ''
        }
      });
      
      if (response.ok) {
        const data: any = await response.json();
        totalAwarded += data.newBadges?.length || 0;
      }
    }

    res.json({
      message: `Checked ${users.length} users and awarded ${totalAwarded} badges`
    });
  } catch (error) {
    console.error('Failed to check all users:', error);
    res.status(500).json({ error: 'Failed to check all users' });
  }
};
