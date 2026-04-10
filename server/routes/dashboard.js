import express from 'express';
import { getDashboardStats, getSupplierStats } from '../controllers/DashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all dashboard statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

// Get supplier statistics specifically (Admin only)
router.get('/supplier-stats', authenticateToken, requireAdmin, getSupplierStats);

export default router;
