import prisma from '../lib/prisma';
import { broadcastBadgeAwarded } from '../socket';

export class BadgeAutoAwardService {
  // Check and award badges for a single user
  static async checkAndAwardUser(userId: number): Promise<number> {
    try {
      // Get user with their current badges
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        return 0;
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
      let newBadgesCount = 0;

      for (const badge of allBadges) {
        // Skip if user already has this badge
        if (currentBadgeIds.includes(badge.id)) {
          continue;
        }

        // Special case: FIRST_POST badge (awarded for creating first post)
        if (badge.name === 'Người tiên phong' || (badge as any).category === 'first_post') {
          if (user._count.posts > 0) {
            try {
              await prisma.userBadge.create({
                data: {
                  userId: user.id,
                  badgeId: badge.id
                }
              });
              newBadgesCount++;
              // console.log(`✓ Awarded badge "${badge.name}" to user ${user.name} (ID: ${userId})`);
              broadcastBadgeAwarded(user.id, badge);
            } catch (error: any) {
              if (error.code !== 'P2002') {
                console.error(`Failed to award badge ${badge.id} to user ${userId}:`, error);
              }
            }
          }
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
          try {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: badge.id
              }
            });
            newBadgesCount++;
            // console.log(`✓ Awarded badge "${badge.name}" to user ${user.name} (ID: ${userId})`);
            
            // Broadcast realtime update
            broadcastBadgeAwarded(user.id, badge);
          } catch (error: any) {
            // Ignore duplicate errors
            if (error.code !== 'P2002') {
              console.error(`Failed to award badge ${badge.id} to user ${userId}:`, error);
            }
          }
        }
      }

      return newBadgesCount;
    } catch (error) {
      console.error(`Failed to check and award badges for user ${userId}:`, error);
      return 0;
    }
  }

  // Check and award badges for all users
  static async checkAndAwardAllUsers(): Promise<{ usersChecked: number; badgesAwarded: number }> {
    try {
      // console.log('🔄 Starting auto-award process for all users...');
      
      const users = await prisma.user.findMany({
        select: { id: true }
      });

      let totalBadgesAwarded = 0;

      for (const user of users) {
        const newBadges = await this.checkAndAwardUser(user.id);
        totalBadgesAwarded += newBadges;
      }

      // console.log(`✅ Auto-award complete: Checked ${users.length} users, awarded ${totalBadgesAwarded} badges`);

      return {
        usersChecked: users.length,
        badgesAwarded: totalBadgesAwarded
      };
    } catch (error) {
      console.error('Failed to auto-award badges for all users:', error);
      return { usersChecked: 0, badgesAwarded: 0 };
    }
  }

  // Run auto-award periodically
  static startAutoAwardSchedule(intervalMinutes: number = 5) {
    // Run immediately on start
    this.checkAndAwardAllUsers();

    // Then run periodically
    setInterval(() => {
      this.checkAndAwardAllUsers();
    }, intervalMinutes * 60 * 1000);

    // console.log(`🤖 Badge auto-award scheduler started (runs every ${intervalMinutes} minutes)`);
  }
}
