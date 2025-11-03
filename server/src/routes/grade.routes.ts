import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as gradeController from '../controllers/grade.controller';

const router = Router();

// Get grades
router.get('/', authenticate, gradeController.getGrades);

// Get grade by ID
router.get('/:id', authenticate, gradeController.getGradeById);

// Create grade (Committee only)
router.post('/', authenticate, isCommittee, gradeController.createGrade);

// Update grade (Committee only)
router.put('/:id', authenticate, isCommittee, gradeController.updateGrade);

// Delete grade (Committee only)
router.delete('/:id', authenticate, isCommittee, gradeController.deleteGrade);

// Import grades from Excel (Committee only)
router.post('/import', authenticate, isCommittee, gradeController.importGrades);

// Export grades to Excel
router.get('/export', authenticate, gradeController.exportGrades);

export default router;
