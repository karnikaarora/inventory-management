import Category from '../models/category.js';

/**
 * ADD CATEGORY CONTROLLER - COMPLETE FLOW EXPLANATION:
 * 
 * OVERALL FLOW:
 * Frontend Request -> Route Middleware -> Controller -> Database -> Response
 * 
 * DETAILED STEP-BY-STEP FLOW:
 * 
 * 1. FRONTEND REQUEST:
 *    - Method: POST
 *    - URL: /api/category/add
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 *    - Body: { "name": "Electronics", "description": "Electronic items" }
 * 
 * 2. ROUTE MIDDLEWARE CHAIN (executes before controller):
 *    a) authenticateToken:
 *       - Extracts JWT from Authorization header
 *       - Verifies token signature and expiration
 *       - Sets req.user = { id: user._id, role: user.role }
 *       - If invalid: returns 401/403, controller never runs
 *    
 *    b) requireAdmin:
 *       - Checks req.user.role === 'admin'
 *       - If not admin: returns 403, controller never runs
 *       - If admin: proceeds to controller
 * 
 * 3. CONTROLLER EXECUTION (this function):
 *    a) Admin role check (double security):
 *       - Verifies req.user.role is 'admin'
 *       - If not: returns 403 (redundant but safe)
 *    
 *    b) Input validation:
 *       - Extracts name, description from req.body
 *       - Validates required fields
 *       - If invalid: returns 400
 *    
 *    c) Database operation:
 *       - Creates new Category document
 *       - Saves to MongoDB
 *       - Handles duplicate name errors
 *    
 *    d) Response:
 *       - Success: returns 201 with category data
 *       - Error: returns appropriate error status
 * 
 * 4. SECURITY LAYERS (defense in depth):
 *    - Layer 1: JWT token validation (middleware)
 *    - Layer 2: Role-based access control (middleware)
 *    - Layer 3: Controller-level role check (redundant safety)
 *    - Layer 4: Input validation and sanitization
 *    - Layer 5: Database-level constraints (unique names)
 */
export const addCategory = async (req, res) => {
  try {
    // SECURITY LAYER 3: Controller-level admin verification (redundant safety)
    // At this point, req.user is already set by authenticateToken middleware
    // req.user contains: { id: user._id, role: user.role }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required to add categories',
        details: 'Only users with admin role can create new categories',
        currentRole: req.user.role,
        userId: req.user.id
      });
    }

    // INPUT VALIDATION LAYER
    // Extract data from request body (sent from frontend)
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: 'Category name is required',
        details: 'Please provide a valid category name'
      });
    }

    // =======================================================================
    // DATABASE OPERATION LAYER
    // =======================================================================
    // Create new category document
    const category = new Category({ 
      name: name.trim(), // Remove extra whitespace
      description: description?.trim() || '' // Optional description
    });
    
    // Save to MongoDB database
    await category.save();

    // =======================================================================
    // SUCCESS RESPONSE LAYER
    // =======================================================================
    res.status(201).json({ 
      message: 'Category added successfully',
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt
      },
      addedBy: {
        userId: req.user.id,
        role: req.user.role
      }
    });
    
  } catch (error) {
    // =======================================================================
    // ERROR HANDLING LAYER
    // =======================================================================
    
    // Handle duplicate category name (MongoDB unique constraint violation)
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Category already exists',
        details: 'A category with this name already exists in the database',
        fieldName: Object.keys(error.keyPattern)[0]
      });
    }
    
    // Handle validation errors (Mongoose schema validation)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        details: errors
      });
    }
    
    // Handle other server errors
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'An unexpected error occurred while adding the category'
    });
  }
};

/**
 * GET ALL CATEGORIES CONTROLLER - COMPLETE FLOW EXPLANATION:
 * 
 * OVERALL FLOW:
 * Frontend Request -> Route -> Controller -> Database -> Response
 * 
 * DETAILED STEP-BY-STEP FLOW:
 * 
 * 1. FRONTEND REQUEST:
 *    - Method: GET
 *    - URL: /api/category/all
 *    - Headers: No authentication required (public endpoint)
 * 
 * 2. CONTROLLER EXECUTION:
 *    a) Fetch all categories from database
 *    b) Sort by creation date (newest first)
 *    c) Return categories list
 * 
 * 3. RESPONSE:
 *    - Success: returns 200 with categories array
 *    - Error: returns appropriate error status
 */
export const getCategories = async (req, res) => {
  try {
    // =======================================================================
    // DATABASE OPERATION LAYER
    // =======================================================================
    // Fetch all categories from MongoDB, sorted by creation date (newest first)
    const categories = await Category.find().sort({ createdAt: -1 });

    // =======================================================================
    // SUCCESS RESPONSE LAYER
    // =======================================================================
    res.status(200).json({
      message: 'Categories fetched successfully',
      categories: categories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt
      })),
      total: categories.length
    });

  } catch (error) {
    // =======================================================================
    // ERROR HANDLING LAYER
    // =======================================================================
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: 'An unexpected error occurred while fetching categories'
    });
  }
};

/**
 * UPDATE CATEGORY CONTROLLER - COMPLETE FLOW EXPLANATION:
 * 
 * OVERALL FLOW:
 * Frontend Request -> Route Middleware -> Controller -> Database -> Response
 * 
 * DETAILED STEP-BY-STEP FLOW:
 * 
 * 1. FRONTEND REQUEST:
 *    - Method: PUT
 *    - URL: /api/category/update/:id
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 *    - Body: { "name": "Updated Name", "description": "Updated Description" }
 * 
 * 2. ROUTE MIDDLEWARE CHAIN (executes before controller):
 *    a) authenticateToken: Validates JWT and sets req.user
 *    b) requireAdmin: Ensures user has admin role
 * 
 * 3. CONTROLLER EXECUTION:
 *    a) Admin role check (double security)
 *    b) Input validation
 *    c) Find and update category by ID
 *    d) Handle category not found
 *    e) Return updated category
 */
export const updateCategory = async (req, res) => {
  try {
    // =======================================================================
    // SECURITY LAYER 3: Controller-level admin verification (redundant safety)
    // =======================================================================
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required to update categories',
        details: 'Only users with admin role can update categories',
        currentRole: req.user.role,
        userId: req.user.id
      });
    }

    // =======================================================================
    // INPUT VALIDATION LAYER
    // =======================================================================
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate category ID
    if (!id) {
      return res.status(400).json({ 
        message: 'Category ID is required',
        details: 'Please provide a valid category ID'
      });
    }
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: 'Category name is required',
        details: 'Please provide a valid category name'
      });
    }

    // =======================================================================
    // DATABASE OPERATION LAYER
    // =======================================================================
    // Find category by ID and update
    const category = await Category.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        description: description?.trim() || ''
      },
      { new: true, runValidators: true } // Return updated document and run validators
    );

    // Check if category exists
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found',
        details: 'No category exists with the provided ID'
      });
    }

    // =======================================================================
    // SUCCESS RESPONSE LAYER
    // =======================================================================
    res.status(200).json({ 
      message: 'Category updated successfully',
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      },
      updatedBy: {
        userId: req.user.id,
        role: req.user.role
      }
    });
    
  } catch (error) {
    // =======================================================================
    // ERROR HANDLING LAYER
    // =======================================================================
    
    // Handle duplicate category name
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Category already exists',
        details: 'A category with this name already exists in the database',
        fieldName: Object.keys(error.keyPattern)[0]
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        details: errors
      });
    }
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid category ID',
        details: 'The provided category ID is not valid'
      });
    }
    
    // Handle other server errors
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'An unexpected error occurred while updating the category'
    });
  }
};

/**
 * DELETE CATEGORY CONTROLLER - COMPLETE FLOW EXPLANATION:
 * 
 * OVERALL FLOW:
 * Frontend Request -> Route Middleware -> Controller -> Database -> Response
 * 
 * DETAILED STEP-BY-STEP FLOW:
 * 
 * 1. FRONTEND REQUEST:
 *    - Method: DELETE
 *    - URL: /api/category/delete/:id
 *    - Headers: { "Authorization": "Bearer <jwt_token>" }
 * 
 * 2. ROUTE MIDDLEWARE CHAIN (executes before controller):
 *    a) authenticateToken: Validates JWT and sets req.user
 *    b) requireAdmin: Ensures user has admin role
 * 
 * 3. CONTROLLER EXECUTION:
 *    a) Admin role check (double security)
 *    b) Validate category ID
 *    c) Find and delete category by ID
 *    d) Handle category not found
 *    e) Return success response
 */
export const deleteCategory = async (req, res) => {
  try {
    // =======================================================================
    // SECURITY LAYER 3: Controller-level admin verification (redundant safety)
    // =======================================================================
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required to delete categories',
        details: 'Only users with admin role can delete categories',
        currentRole: req.user.role,
        userId: req.user.id
      });
    }

    // =======================================================================
    // INPUT VALIDATION LAYER
    // =======================================================================
    const { id } = req.params;
    
    // Validate category ID
    if (!id) {
      return res.status(400).json({ 
        message: 'Category ID is required',
        details: 'Please provide a valid category ID'
      });
    }

    // =======================================================================
    // DATABASE OPERATION LAYER
    // =======================================================================
    // Find category by ID and delete
    const category = await Category.findByIdAndDelete(id);

    // Check if category exists
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found',
        details: 'No category exists with the provided ID'
      });
    }

    // =======================================================================
    // SUCCESS RESPONSE LAYER
    // =======================================================================
    res.status(200).json({ 
      message: 'Category deleted successfully',
      deletedCategory: {
        id: category._id,
        name: category.name,
        description: category.description
      },
      deletedBy: {
        userId: req.user.id,
        role: req.user.role
      }
    });
    
  } catch (error) {
    // =======================================================================
    // ERROR HANDLING LAYER
    // =======================================================================
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid category ID',
        details: 'The provided category ID is not valid'
      });
    }
    
    // Handle other server errors
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'An unexpected error occurred while deleting the category'
    });
  }
};
