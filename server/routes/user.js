import express from 'express';
import { getUsers, updateUser, deleteUser, getUserStats } from '../controllers/UserController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/get', authenticateToken, requireAdmin, getUsers);

// Update user role (Admin only)
router.put('/update/:id', authenticateToken, requireAdmin, updateUser);

// Delete user (Admin only)
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteUser);

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, getUserStats);

export default router;
