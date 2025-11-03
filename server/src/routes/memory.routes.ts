import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as memoryController from '../controllers/memory.controller';

const router = Router();

// Get all memories
router.get('/', memoryController.getAllMemories);

// Upload memory (using Google Drive URL)
router.post(
  '/', 
  authenticate, 
  memoryController.uploadMemory
);

// React to memory
router.post('/:id/react', authenticate, memoryController.reactToMemory);

// Approve memory (Committee only)
router.post('/:id/approve', authenticate, isCommittee, memoryController.approveMemory);

// Delete memory
router.delete('/:id', authenticate, memoryController.deleteMemory);

export default router;
