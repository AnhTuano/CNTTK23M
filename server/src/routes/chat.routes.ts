import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Get all chat rooms
router.get('/rooms', authenticate, chatController.getAllRooms);

// Create a new chat room
router.post('/rooms', authenticate, chatController.createRoom);

// Get messages in a room
router.get('/rooms/:id/messages', authenticate, chatController.getRoomMessages);

// Clear chat history in a room (Admin only)
router.delete('/rooms/:id/clear', authenticate, isAdmin, chatController.clearRoomHistory);

// Delete a chat room (Admin only)
router.delete('/rooms/:id', authenticate, isAdmin, chatController.deleteRoom);

export default router;
