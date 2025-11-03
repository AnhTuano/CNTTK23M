import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import * as configController from '../controllers/config.controller';

const router = Router();

// Get website config
router.get('/', configController.getConfig);

// Update website config (Admin only)
router.put('/', authenticate, isAdmin, configController.updateConfig);

export default router;
