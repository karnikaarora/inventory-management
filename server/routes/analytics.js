import express from 'express';
import { getSalesTrends, getLowStockAlerts, getTopProducts } from '../controllers/AnalyticsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get sales trends (Admin only)
router.get('/sales-trends', authenticateToken, requireAdmin, getSalesTrends);

// Get low stock alerts (Admin only)
router.get('/low-stock', authenticateToken, requireAdmin, getLowStockAlerts);

// Get top products (Admin only)
router.get('/top-products', authenticateToken, requireAdmin, getTopProducts);

export default router;
