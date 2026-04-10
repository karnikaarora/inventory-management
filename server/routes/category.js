import express from 'express';
import { addCategory, getCategories, updateCategory, deleteCategory } from '../controllers/CategoryController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

/**
 * CATEGORY ROUTES FLOW - COMPLETE EXPLANATION:
 * 
 * This file defines all category-related API endpoints with their security layers and flow.
 * 
 * SECURITY ARCHITECTURE:
 * - Public endpoints: No authentication required
 * - Protected endpoints: JWT token + Admin role required
 * 
 * FLOW PATTERN:
 * Frontend Request -> Middleware Chain -> Controller -> Database -> Response
 */

// Create a new Express router for category-related routes
const router = express.Router();

/**
 * Route: POST /api/category/add
 * Purpose: Creates a new category (PROTECTED ENDPOINT)
 * 
 * SECURITY LAYERS:
 * 1. authenticateToken - Validates JWT token and sets req.user
 * 2. requireAdmin - Ensures user has admin role
 * 
 * COMPLETE FLOW:
 * 1. Frontend sends POST request to /api/category/add
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 *    - Body: { "name": "Electronics", "description": "Electronic items" }
 * 
 * 2. authenticateToken middleware runs:
 *    - Extracts token from Authorization header
 *    - Verifies JWT signature and expiration using JWT_SECRET
 *    - Sets req.user = { id: user._id, role: user.role }
 *    - If token invalid/expired: returns 403, stops execution
 *    - If no token: returns 401, stops execution
 * 
 * 3. requireAdmin middleware runs:
 *    - Checks if req.user.role === 'admin'
 *    - If not admin: returns 403, stops execution
 *    - If admin: proceeds to controller
 * 
 * 4. addCategory controller executes:
 *    - Double-checks admin role (redundant security)
 *    - Validates input data (name required)
 *    - Creates new Category document
 *    - Saves to MongoDB with unique constraint on name
 *    - Returns success response with new category data
 * 
 * 5. Frontend receives success and refreshes categories list
 * 
 * SECURITY: Only authenticated admin users can add categories
 */
router.post('/add', authenticateToken, requireAdmin, addCategory);

/**
 * Route: GET /api/category/all
 * Purpose: Fetches all categories from database (PUBLIC ENDPOINT)
 * 
 * SECURITY: No authentication required - anyone can view categories
 * 
 * COMPLETE FLOW:
 * 1. Frontend sends GET request to /api/category/all
 * 2. No middleware runs (public endpoint)
 * 3. getCategories controller executes:
 *    - Fetches all categories from MongoDB
 *    - Sorts by creation date (newest first)
 *    - Returns formatted categories array
 * 4. Frontend receives categories list and displays them
 * 
 * USE CASE: Displaying categories on right side of add category form
 */
router.get('/all', getCategories);

/**
 * Route: PUT /api/category/update/:id
 * Purpose: Updates an existing category by ID (PROTECTED ENDPOINT)
 * 
 * SECURITY LAYERS:
 * 1. authenticateToken - Validates JWT token and sets req.user
 * 2. requireAdmin - Ensures user has admin role
 * 
 * COMPLETE FLOW:
 * 1. Frontend sends PUT request to /api/category/update/:id
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 *    - URL Params: :id (category ID to update)
 *    - Body: { "name": "Updated Name", "description": "Updated Description" }
 * 
 * 2. authenticateToken middleware runs:
 *    - Extracts and validates JWT token
 *    - Sets req.user with user data
 *    - Returns 401/403 if authentication fails
 * 
 * 3. requireAdmin middleware runs:
 *    - Verifies user has admin role
 *    - Returns 403 if not admin
 * 
 * 4. updateCategory controller executes:
 *    - Validates category ID and input data
 *    - Finds category by ID and updates with new data
 *    - Handles duplicate names, validation errors, not found cases
 *    - Returns updated category data
 * 
 * 5. Frontend receives success and refreshes categories list
 * 
 * SECURITY: Only authenticated admin users can update categories
 */
router.put('/update/:id', authenticateToken, requireAdmin, updateCategory);

/**
 * Route: DELETE /api/category/delete/:id
 * Purpose: Deletes a category by ID (PROTECTED ENDPOINT)
 * 
 * SECURITY LAYERS:
 * 1. authenticateToken - Validates JWT token and sets req.user
 * 2. requireAdmin - Ensures user has admin role
 * 
 * COMPLETE FLOW:
 * 1. Frontend sends DELETE request to /api/category/delete/:id
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 *    - URL Params: :id (category ID to delete)
 *    - No body required for DELETE
 * 
 * 2. authenticateToken middleware runs:
 *    - Extracts and validates JWT token
 *    - Sets req.user with user data
 *    - Returns 401/403 if authentication fails
 * 
 * 3. requireAdmin middleware runs:
 *    - Verifies user has admin role
 *    - Returns 403 if not admin
 * 
 * 4. deleteCategory controller executes:
 *    - Validates category ID
 *    - Finds category by ID and deletes it
 *    - Handles not found and invalid ID cases
 *    - Returns success response with deleted category info
 * 
 * 5. Frontend receives success and refreshes categories list
 * 
 * SECURITY: Only authenticated admin users can delete categories
 */
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteCategory); 
export default router;
