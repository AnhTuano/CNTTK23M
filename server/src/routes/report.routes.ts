import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get all reports (admin only)
router.get('/', authenticate, reportController.getAllReports);

// Create report
router.post('/', authenticate, reportController.createReport);

// Update report status (admin only)
router.patch('/:id/status', authenticate, reportController.updateReportStatus);

// Delete report (admin only)
router.delete('/:id', authenticate, reportController.deleteReport);

export default router;
