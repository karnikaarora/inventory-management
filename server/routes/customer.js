import express from 'express';
import { 
    getCustomerOrders, 
    createCustomerOrder, 
    updateCustomerProfile, 
    changeCustomerPassword, 
    getCustomerStats 
} from '../controllers/CustomerController.js';
import { getOrders } from '../controllers/OrderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get customer's orders
router.get('/orders', authenticateToken, getCustomerOrders);

// Create new order
router.post('/orders', authenticateToken, createCustomerOrder);

// Update customer profile
router.put('/profile', authenticateToken, updateCustomerProfile);

// Change password
router.put('/password', authenticateToken, changeCustomerPassword);

// Get customer statistics
router.get('/stats', authenticateToken, getCustomerStats);

// Debug endpoint - get all orders to see what's in database
router.get('/debug-orders', authenticateToken, getOrders);

export default router;
