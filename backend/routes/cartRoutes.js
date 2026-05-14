// Cart routes protected by JWT authentication middleware.
import express from 'express';
import {
  addCartItem,
  clearCartItems,
  deleteCartItem,
  getCartItems,
  updateCartItemQuantity,
} from '../controllers/cartController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCartItems);
router.post('/', protect, addCartItem);
router.delete('/', protect, clearCartItems);
router.patch('/:id', protect, updateCartItemQuantity);
router.delete('/:id', protect, deleteCartItem);

export default router;
