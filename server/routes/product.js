import express from 'express';
import { addProduct, getProducts, updateProduct, deleteProduct } from '../controllers/ProductController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Add product (Admin only)
router.post('/add', authenticateToken, requireAdmin, addProduct);

// Get all products (Authenticated users)
router.get('/get', authenticateToken, getProducts);

// Update product (Admin only)
router.put('/update/:id', authenticateToken, requireAdmin, updateProduct);

// Delete product (Admin only)
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;
