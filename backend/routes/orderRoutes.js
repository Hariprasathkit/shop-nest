import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import adminOnly from '../middleware/adminMiddleware.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/my', protect, getMyOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
