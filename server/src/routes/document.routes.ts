import { Router } from 'express';
import { authenticate, isCommittee } from '../middleware/auth.middleware';
import * as documentController from '../controllers/document.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Get all documents
router.get('/', documentController.getAllDocuments);

// Upload document (supports both file upload and link)
router.post(
  '/', 
  authenticate,
  (req, res, next) => {
    // Only use multer if Content-Type is multipart/form-data
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return upload.single('file')(req, res, next);
    }
    next();
  },
  documentController.uploadDocument
);

// Approve document (Committee only)
router.post('/:id/approve', authenticate, isCommittee, documentController.approveDocument);

// Delete document
router.delete('/:id', authenticate, documentController.deleteDocument);

export default router;
