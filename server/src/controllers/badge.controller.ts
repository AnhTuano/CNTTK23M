import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { BadgeCategory } from '@prisma/client';

// Get all badges
export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(badges);
  } catch (error) {
    console.error('Failed to get badges:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
};

// Get single badge
export const getBadge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const badge = await prisma.badge.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    res.json(badge);
  } catch (error) {
    console.error('Failed to get badge:', error);
    res.status(500).json({ error: 'Failed to get badge' });
  }
};

// Create new badge
export const createBadge = async (req: Request, res: Response) => {
  try {
    const { id, name, description, icon, color, requiredPoints, category } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    // Create badge with custom ID if provided, otherwise let Prisma generate
    const badge = await prisma.badge.create({
      data: {
        ...(id && { id }), // Only include id if provided
        name,
        description,
        icon: icon || 'Award',
        color: color || 'text-gray-400',
        requiredPoints: requiredPoints || 0,
        category: category || 'all'
      }
    });
    
    res.status(201).json(badge);
  } catch (error: any) {
    console.error('Failed to create badge:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Badge with this ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create badge' });
  }
};

// Update badge
export const updateBadge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, requiredPoints, category } = req.body;
    
    const badge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(requiredPoints !== undefined && { requiredPoints }),
        ...(category && { category })
      }
    });
    
    res.json(badge);
  } catch (error: any) {
    console.error('Failed to update badge:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    res.status(500).json({ error: 'Failed to update badge' });
  }
};

// Delete badge
export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete badge (UserBadge entries will be deleted automatically due to CASCADE)
    await prisma.badge.delete({
      where: { id }
    });
    
    res.json({ message: 'Badge deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete badge:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete badge' });
  }
};

// Seed default badges
export const seedDefaultBadges = async (req: Request, res: Response) => {
  try {
    const defaultBadges = [
      {
        id: 'FIRST_POST',
        name: 'Người tiên phong',
        description: 'Đã tạo bài đăng đầu tiên.',
        icon: 'Award',
        color: '#fb923c', // orange-400
        requiredPoints: 0,
        category: 'first_post' as BadgeCategory
      },
      {
        id: 'PROLIFIC_POSTER',
        name: 'Người đăng bài tích cực',
        description: 'Đã đăng hơn 10 thông báo.',
        icon: 'Newspaper',
        color: '#60a5fa', // blue-400
        requiredPoints: 100,
        category: 'posts' as BadgeCategory
      },
      {
        id: 'LIBRARIAN',
        name: 'Thủ thư',
        description: 'Đã chia sẻ hơn 10 tài liệu.',
        icon: 'BookOpenCheck',
        color: '#4ade80', // green-400
        requiredPoints: 150,
        category: 'documents' as BadgeCategory
      },
      {
        id: 'COMMUNICATOR',
        name: 'Người giao tiếp',
        description: 'Đã viết hơn 50 bình luận.',
        icon: 'MessageCircleMore',
        color: '#c084fc', // purple-400
        requiredPoints: 250,
        category: 'comments' as BadgeCategory
      },
      {
        id: 'TOP_CONTRIBUTOR',
        name: 'Người đóng góp hàng đầu',
        description: 'Đạt điểm cao nhất trên bảng thành tích!',
        icon: 'Sparkles',
        color: '#facc15', // yellow-400
        requiredPoints: 0,
        category: 'special' as BadgeCategory
      }
    ];

    const createdBadges = [];
    
    for (const badgeData of defaultBadges) {
      try {
        const badge = await prisma.badge.upsert({
          where: { id: badgeData.id },
          update: badgeData,
          create: badgeData
        });
        createdBadges.push(badge);
      } catch (error) {
        console.error(`Failed to seed badge ${badgeData.id}:`, error);
      }
    }

    res.json({ 
      message: 'Default badges seeded successfully',
      badges: createdBadges
    });
  } catch (error) {
    console.error('Failed to seed default badges:', error);
    res.status(500).json({ error: 'Failed to seed default badges' });
  }
};
