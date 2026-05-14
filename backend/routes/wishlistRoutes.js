import express from 'express';
import {
  addWishlistItem,
  deleteWishlistItem,
  getWishlistItems,
} from '../controllers/wishlistController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlistItems);
router.post('/', protect, addWishlistItem);
router.delete('/:id', protect, deleteWishlistItem);

export default router;
