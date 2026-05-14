import express from 'express';
import {
  createReview,
  deleteReview,
  getReviewsByProduct,
  updateReview,
} from '../controllers/reviewController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/:productId', getReviewsByProduct);

export default router;
