import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import * as backupController from '../controllers/backup.controller';

const router = Router();

// All backup routes require admin authentication
router.use(authenticate, isAdmin);

// Create a new backup
router.post('/create', backupController.createBackup);

// List all backups
router.get('/list', backupController.listBackups);

// Download a specific backup
router.get('/download/:filename', backupController.downloadBackup);

// Restore from backup
router.post('/restore', backupController.restoreBackup);

// Delete a backup
router.delete('/:filename', backupController.deleteBackup);

export default router;
