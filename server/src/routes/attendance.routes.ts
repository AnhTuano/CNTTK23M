import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// Get attendance records
router.get('/', authenticate, attendanceController.getAttendance);

// Check-in
router.post('/check-in', authenticate, attendanceController.checkIn);

// Get attendance report (Committee only)
router.get('/report', authenticate, isCommittee, attendanceController.getAttendanceReport);

export default router;
