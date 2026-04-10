import express from 'express';
import { createOrder, getOrders, updateOrder, deleteOrder, getOrderStats } from '../controllers/OrderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create new order (Admin only)
router.post('/create', authenticateToken, createOrder);

// Get customer's orders (Customer only)
router.get('/customer', authenticateToken, getOrders);

// Get all orders (Admin only)
router.get('/get', authenticateToken, requireAdmin, getOrders);

// Update order status (Admin only)
router.put('/update/:id', authenticateToken, requireAdmin, updateOrder);

// Delete order (Admin only)
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteOrder);

// Get order statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, getOrderStats);

export default router;
