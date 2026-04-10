import express from 'express';
import { addSupplier, getSuppliers, updateSupplier, deleteSupplier } from '../controllers/SupplierController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

// Create a new Express router for supplier-related routes
const router = express.Router();

/**
 * Route: POST /api/supplier/add
 * Purpose: Receives a request from the frontend to add a new supplier.
 * Flow:
 *   - Frontend sends POST request to this endpoint with supplier data and JWT token.
 *   - authenticateToken middleware verifies the JWT token.
 *   - requireAdmin middleware ensures user has admin role.
 *   - This route passes the request to the addSupplier controller function.
 * 
 * Route: GET /api/supplier/get
 * Purpose: Get all suppliers for display
 * Flow:
 *   - authenticateToken middleware verifies the JWT token.
 *   - This route passes the request to the getSuppliers controller function.
 * 
 * Route: PUT /api/supplier/update/:id
 * Purpose: Update an existing supplier
 * Flow:
 *   - authenticateToken middleware verifies the JWT token.
 *   - requireAdmin middleware ensures user has admin role.
 *   - This route passes the request to the updateSupplier controller function.
 * 
 * Route: DELETE /api/supplier/delete/:id
 * Purpose: Delete a supplier
 * Flow:
 *   - authenticateToken middleware verifies the JWT token.
 *   - requireAdmin middleware ensures user has admin role.
 *   - This route passes the request to the deleteSupplier controller function.
 * 
 */
router.post('/add', authenticateToken, requireAdmin, addSupplier); 
router.get('/get', authenticateToken, getSuppliers); 
router.put('/update/:id', authenticateToken, requireAdmin, updateSupplier); 
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteSupplier); 

export default router;
