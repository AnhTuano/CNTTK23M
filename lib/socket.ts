import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const SOCKET_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL
    ? import.meta.env.VITE_SOCKET_URL
    : 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected manually');
  }
};

// Emit events
export const joinRoom = (roomId: string) => {
  socket?.emit('join:room', roomId);
};

export const leaveRoom = (roomId: string) => {
  socket?.emit('leave:room', roomId);
};

export const sendMessage = (roomId: string, text: string) => {
  socket?.emit('message:send', { roomId, text });
};

export const startTyping = (roomId: string) => {
  socket?.emit('typing:start', { roomId });
};

export const stopTyping = (roomId: string) => {
  socket?.emit('typing:stop', { roomId });
};
