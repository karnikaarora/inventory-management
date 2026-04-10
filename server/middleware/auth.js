import jwt from 'jsonwebtoken';
/**
 * AUTHENTICATION MIDDLEWARE FLOW:
 * 1. authenticateToken:
 *    - Extracts JWT token from Authorization header (Bearer token)
 *    - Verifies token using JWT_SECRET from environment
 *    - If valid, attaches user payload (id, role) to req.user
 *    - If invalid/expired, returns 403 Forbidden
 *    - If no token, returns 401 Unauthorized
 * 
 * 2. requireAdmin:
 *    - Checks if req.user.role is 'admin'
 *    - Only allows admin users to proceed
 *    - Non-admin users get 403 Forbidden
 * 
 * FLOW SEQUENCE:
 * Frontend Request -> authenticateToken -> requireAdmin -> Controller
 */

export const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  // Format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer "

  // STEP 1: Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      details: 'Please provide a valid JWT token in Authorization header'
    });
  }

  // STEP 2: Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or expired token',
        details: 'Please login again to get a new token'
      });
    }
    
    // STEP 3: Attach user payload to request object
    // This makes user info available in subsequent middleware and controllers
    req.user = user; // Contains { id: user._id, role: user.role }
    next(); // Proceed to next middleware/route handler
  });
};

export const requireAdmin = (req, res, next) => {
  // STEP 1: Check if user has admin role
  // req.user is set by authenticateToken middleware
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      details: 'Only admin users can perform this action',
      currentRole: req.user.role
    });
  }
  
  // STEP 2: User is admin, proceed to next middleware/controller
  next();
};
