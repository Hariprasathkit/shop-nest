import express from 'express';
import {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicketById,
  getSupportTickets,
  replyToSupportTicket,
  userReplyToSupportTicket,
} from '../controllers/supportController.js';
import adminOnly from '../middleware/adminMiddleware.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSupportTicket);
router.get('/my', protect, getMySupportTickets);
router.get('/:id', protect, getSupportTicketById);
router.post('/:id/reply', protect, adminOnly, replyToSupportTicket);
router.post('/:id/user-reply', protect, userReplyToSupportTicket);
router.get('/', protect, adminOnly, getSupportTickets);

export default router;
