import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as eventController from '../controllers/event.controller';

const router = Router();

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create event
router.post('/', authenticate, eventController.createEvent);

// Update event
router.put('/:id', authenticate, eventController.updateEvent);

// Delete event
router.delete('/:id', authenticate, eventController.deleteEvent);

// Participate in event
router.post('/:id/participate', authenticate, eventController.participateInEvent);

export default router;
