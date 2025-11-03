import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';
import { broadcastChatHistoryCleared } from '../socket';

// Get all chat rooms
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const rooms = await prisma.chatRoom.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        allowedRoles: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: {
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

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get messages in a room
export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId: id,
        ...(before ? {
          createdAt: {
            lt: new Date(before as string)
          }
        } : {})
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Create a new chat room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, description, icon, members, allowedRoles } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    // Prepare member IDs (creator + selected members)
    const memberIds = [userId];
    if (Array.isArray(members)) {
      members.forEach((id: number) => {
        if (id !== userId && !memberIds.includes(id)) {
          memberIds.push(id);
        }
      });
    }

    // Create the room with members and allowed roles
    const room = await prisma.chatRoom.create({
      data: {
        name: name.trim(),
        description: description || '',
        icon: icon || 'MessageSquare',
        isPrivate: false,
        members: {
          create: memberIds.map((id: number) => ({ userId: id }))
        },
        allowedRoles: allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0
          ? {
              create: allowedRoles.map((role: Role) => ({ role }))
            }
          : undefined
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        allowedRoles: true
      }
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Delete a chat room (Admin only)
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user?.role;

    // Double check admin permission
    if (userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can delete chat rooms' });
    }

    // Check if room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id }
    });

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Delete all messages in the room first
    await prisma.chatMessage.deleteMany({
      where: { roomId: id }
    });

    // Delete room members
    await prisma.chatRoomMember.deleteMany({
      where: { roomId: id }
    });

    // Delete allowed roles
    await prisma.chatRoomRole.deleteMany({
      where: { roomId: id }
    });

    // Finally, delete the room
    await prisma.chatRoom.delete({
      where: { id }
    });

    console.log(`✅ Admin deleted chat room: ${room.name} (${id})`);
    res.json({ message: 'Chat room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

// Clear chat history in a room (Admin only)
export const clearRoomHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { period = 'all' } = req.query; // '7days', '1month', 'all'
    const userRole = (req as any).user?.role;

    // Double check admin permission
    if (userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can clear chat history' });
    }

    // Check if room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id }
    });

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    let whereClause: any = { roomId: id };
    
    // Calculate date filter based on period
    if (period === '7days' || period === '1month') {
      const now = new Date();
      const daysToSubtract = period === '7days' ? 7 : 30;
      const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
      
      whereClause.createdAt = {
        lt: cutoffDate // Delete messages older than cutoff date
      };
    }
    // If period is 'all', delete all messages (no date filter)

    // Delete messages based on period
    const result = await prisma.chatMessage.deleteMany({
      where: whereClause
    });

    const periodText = 
      period === '7days' ? '7 ngày gần đây' :
      period === '1month' ? '1 tháng gần đây' :
      'toàn bộ';

    console.log(`✅ Admin cleared chat history (${periodText}) in room: ${room.name} (${id}) - ${result.count} messages deleted`);
    
    // Broadcast to all users in realtime
    broadcastChatHistoryCleared(id, period as string, result.count);
    
    res.json({ 
      message: `Chat history cleared successfully (${periodText})`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
