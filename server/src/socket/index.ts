import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';
import prisma from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

// Track online users
const onlineUsers = new Map<number, Set<string>>(); // userId -> Set of socket IDs

// Get online users for a room
export const getOnlineUsersInRoom = (roomMembers: number[]): number[] => {
  return roomMembers.filter(userId => onlineUsers.has(userId));
};

// Global broadcast functions for real-time updates
let ioInstance: Server;

export const broadcastPostUpdate = (action: 'create' | 'update' | 'delete', post: any) => {
  if (ioInstance) {
    ioInstance.emit('post:update', { action, post });
  }
};

export const broadcastDocumentUpdate = (action: 'create' | 'update' | 'delete', document: any) => {
  if (ioInstance) {
    ioInstance.emit('document:update', { action, document });
  }
};

export const broadcastMemoryUpdate = (action: 'create' | 'update' | 'delete', memory: any) => {
  if (ioInstance) {
    ioInstance.emit('memory:update', { action, memory });
  }
};

export const broadcastUserUpdate = (action: 'update', user: any) => {
  if (ioInstance) {
    ioInstance.emit('user:update', { action, user });
  }
};

export const broadcastCommentUpdate = (action: 'create' | 'delete', postId: number, comment?: any) => {
  if (ioInstance) {
    ioInstance.emit('comment:update', { action, postId, comment });
  }
};

export const broadcastVoteUpdate = (postId: number, votes: any) => {
  if (ioInstance) {
    ioInstance.emit('vote:update', { postId, votes });
  }
};

export const broadcastReportUpdate = (action: 'create' | 'update', report: any) => {
  if (ioInstance) {
    ioInstance.emit('report:update', { action, report });
  }
};

export const broadcastConfigUpdate = (config: any) => {
  if (ioInstance) {
    ioInstance.emit('config:update', config);
  }
};

export const broadcastBadgeAwarded = (userId: number, badge: any) => {
  if (ioInstance) {
    // Send to specific user's sockets
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        ioInstance.to(socketId).emit('badge:awarded', { badge });
      });
    }
    // Also broadcast to all for leaderboard updates
    ioInstance.emit('user:badges:update', { userId, badge });
  }
};

export const broadcastChatHistoryCleared = (roomId: string, period: string, deletedCount: number) => {
  if (ioInstance) {
    ioInstance.emit('chat:history:cleared', { roomId, period, deletedCount });
  }
};

export const broadcastNotificationUpdate = (userId: number, action: 'create' | 'update' | 'delete', notification?: any) => {
  if (ioInstance) {
    // Send to specific user's sockets
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        ioInstance.to(socketId).emit('notification:update', { action, notification });
      });
    }
  }
};

export const setupSocketIO = (io: Server) => {
  // Store io instance for broadcasting
  ioInstance = io;

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.userId} connected`);

    // Track user as online
    if (socket.userId) {
      if (!onlineUsers.has(socket.userId)) {
        onlineUsers.set(socket.userId, new Set());
      }
      onlineUsers.get(socket.userId)!.add(socket.id);
      
      // Broadcast user online status
      io.emit('user:online', { userId: socket.userId });
      
      // Send current online users list to newly connected user
      const allOnlineUserIds = Array.from(onlineUsers.keys());
      socket.emit('users:online', { userIds: allOnlineUserIds });
    }

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join chat room
    socket.on('join:room', async (roomId: string) => {
      try {
        // Verify user has access to this room
        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: {
            allowedRoles: true,
            members: true
          }
        });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if room is private and user has access
        if (room.isPrivate) {
          const hasRoleAccess = room.allowedRoles.some(r => r.role === socket.userRole);
          const isMember = room.members.some(m => m.userId === socket.userId);
          
          if (!hasRoleAccess && !isMember) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }
        }

        socket.join(`room:${roomId}`);
        socket.emit('joined:room', { roomId });
        console.log(`User ${socket.userId} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave chat room
    socket.on('leave:room', (roomId: string) => {
      socket.leave(`room:${roomId}`);
      socket.emit('left:room', { roomId });
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Send message
    socket.on('message:send', async (data: { roomId: string; text: string }) => {
      try {
        const { roomId, text } = data;

        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            roomId,
            senderId: socket.userId!,
            text
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
          }
        });

        // Broadcast to room
        io.to(`room:${roomId}`).emit('message:new', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit('user:typing', { 
        userId: socket.userId,
        roomId: data.roomId 
      });
    });

    socket.on('typing:stop', (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit('user:stopped-typing', { 
        userId: socket.userId,
        roomId: data.roomId 
      });
    });

    // Online status
    socket.on('status:online', () => {
      io.emit('user:online', { userId: socket.userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      
      // Remove user from online tracking
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId)!;
        userSockets.delete(socket.id);
        
        // If user has no more connections, mark as offline
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit('user:offline', { userId: socket.userId });
        }
      }
    });
  });

  return io;
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (io: Server, userId: number, notification: any) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

// Helper function to broadcast notification to all users
export const broadcastNotification = (io: Server, notification: any) => {
  io.emit('notification:new', notification);
};
