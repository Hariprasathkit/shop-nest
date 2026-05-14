// Authentication routes for register, login, and profile access.
import express from 'express';
import { getUserProfile, loginUser, registerUser } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
