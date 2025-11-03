import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';
import { broadcastMemoryUpdate } from '../socket';
import { createNotificationHelper, createBulkNotifications } from './notification.controller';

// Get all memories
export const getAllMemories = async (req: Request, res: Response) => {
  try {
    const { includeAll } = req.query;
    
    const memories = await prisma.memory.findMany({
      where: includeAll === 'true' ? {} : { status: 'DaDuyet' },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
};

// Upload memory
export const uploadMemory = async (req: Request, res: Response) => {
  try {
    const { semester, url } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!url || !semester) {
      return res.status(400).json({ error: 'URL and semester are required' });
    }

    // Auto-approve for Admin, LopTruong, BiThu
    const bypassRoles = ['Admin', 'LopTruong', 'BiThu'];
    const status = bypassRoles.includes(userRole) ? 'DaDuyet' : 'ChoDuyet';

    const memory = await prisma.memory.create({
      data: {
        url,
        thumbnail: url,
        semester,
        uploaderId: userId,
        status
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    console.log('✅ Memory created:', memory.id, 'Status:', status);
    
    // Broadcast real-time update
    broadcastMemoryUpdate('create', memory);
    
    res.status(201).json(memory);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload memory' });
  }
};

// React to memory
export const reactToMemory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = (req as any).user?.id;

    const existingReaction = await prisma.memoryReaction.findUnique({
      where: {
        userId_memoryId_emoji: {
          memoryId: parseInt(id),
          userId,
          emoji
        }
      }
    });

    if (existingReaction) {
      // Remove reaction if exists
      await prisma.memoryReaction.delete({
        where: {
          userId_memoryId_emoji: {
            memoryId: parseInt(id),
            userId,
            emoji
          }
        }
      });
    } else {
      // Create new reaction
      await prisma.memoryReaction.create({
        data: {
          memoryId: parseInt(id),
          userId,
          emoji
        }
      });
    }

    res.json({ message: 'Reaction recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to react' });
  }
};

// Approve memory
export const approveMemory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const memory = await prisma.memory.update({
      where: { id: parseInt(id) },
      data: {
        status: 'DaDuyet'
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Broadcast memory approval
    broadcastMemoryUpdate('update', memory);

    // Notify uploader
    await createNotificationHelper(
      memory.uploader.id,
      'memory',
      'Kỷ niệm được duyệt',
      `Kỷ niệm "${memory.caption || 'Không có tiêu đề'}" của bạn đã được phê duyệt!`
    );

    // Notify all users about new memory
    const allUsers = await prisma.user.findMany({
      where: { 
        id: { not: memory.uploader.id },
        locked: false 
      },
      select: { id: true }
    });
    
    await createBulkNotifications(
      allUsers.map(u => u.id),
      'memory',
      'Kỷ niệm mới',
      `${memory.uploader.name} đã thêm kỷ niệm mới!`
    );

    res.json(memory);
  } catch (error) {
    console.error('Approve memory error:', error);
    res.status(500).json({ error: 'Failed to approve memory' });
  }
};

// Delete memory
export const deleteMemory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const memory = await prisma.memory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Delete from database
    await prisma.memory.delete({
      where: { id: parseInt(id) }
    });

    // Broadcast real-time update
    broadcastMemoryUpdate('delete', { id: parseInt(id) });

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
};
