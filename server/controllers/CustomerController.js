// Import required models for database operations
import Order from '../models/order.js';        // For order-related database operations
import Product from '../models/product.js';    // For product-related database operations
import User from '../models/user.js';          // For user-related database operations
import bcrypt from 'bcrypt';                  // For password hashing/comparison

/**
 * Get customer's orders
 * FLOW: Frontend calls API → Middleware verifies JWT → Controller finds user's orders → Returns orders
 */
export const getCustomerOrders = async (req, res) => {
    try {
        // DEBUG: Log request start for debugging
        console.log('=== GETTING CUSTOMER ORDERS ===');
        
        // req.user comes from authenticateToken middleware (contains decoded JWT data)
        console.log('User from token:', req.user);
        console.log('User email:', req.user.email);
        
        // DATABASE QUERY: Find all orders where customerEmail matches logged-in user's email
        // This ensures customers can only see their own orders (data isolation)
        const orders = await Order.find({ 
            customerEmail: req.user.email  // Filter by logged-in user's email
        }).sort({ createdAt: -1 });         // Sort by newest first (descending)
        
        // DEBUG: Log results for troubleshooting
        console.log('Customer orders found:', orders.length);
        console.log('Orders details:', orders);
        
        // SUCCESS RESPONSE: Return orders array with 200 status
        res.status(200).json(orders);
        
    } catch (error) {
        // ERROR HANDLING: Log detailed error for debugging
        console.error('=== ERROR GETTING CUSTOMER ORDERS ===');
        console.error('Error getting customer orders:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new order for customer
 * FLOW: Frontend sends order data → Middleware verifies JWT → Controller validates → Creates order → Saves to DB
 */
export const createCustomerOrder = async (req, res) => {
    try {
        // DEBUG: Log order creation start
        console.log('Creating order for customer:', req.user.email);
        
        // EXTRACT order data from request body (sent from frontend)
        const { items, totalAmount, customerName, customerPhone, customerAddress, paymentMethod } = req.body;
        
        // INPUT VALIDATION: Ensure required fields are present
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: 'Valid total amount is required' });
        }
        
        // ORDER NUMBER GENERATION: Create unique order ID
        const orderNumber = 'ORD-' + Date.now();
        
        // CREATE ORDER OBJECT: Build new order document
        const newOrder = new Order({
            orderNumber,                                    // Unique order identifier
            customerName: customerName || req.user.name,   // Use provided name or fallback to user profile
            customerEmail: req.user.email,                 // Use authenticated user's email
            customerPhone: customerPhone || req.user.phone, // Use provided phone or fallback
            customerAddress: customerAddress || req.user.address, // Use provided address or fallback
            items,                                          // Array of ordered items
            totalAmount,                                    // Total order price
            paymentMethod: paymentMethod || 'Cash on Delivery', // Default payment method
            status: 'pending',                             // Initial order status
            priority: 'medium',                            // Default priority
            createdAt: new Date(),                         // Current timestamp
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        
        // DATABASE OPERATION: Save order to MongoDB
        await newOrder.save();
        console.log('Customer order created successfully:', newOrder);
        
        // SUCCESS RESPONSE: Return created order with 201 status (Created)
        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: newOrder
        });
        
    } catch (error) {
        // ERROR HANDLING: Log error and return server error response
        console.error('Error creating customer order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update customer profile
 * FLOW: Frontend sends profile data → Middleware verifies JWT → Controller validates → Updates user in DB
 */
export const updateCustomerProfile = async (req, res) => {
    try {
        // DEBUG: Log profile update start
        console.log('Updating profile for customer:', req.user.id);
        
        // EXTRACT profile data from request body
        const { name, email, phone, address } = req.body;
        
        // INPUT VALIDATION: Ensure all required fields are present
        if (!name || !email || !phone || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // EMAIL DUPLICATION CHECK: Prevent multiple accounts with same email
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }
        
        // DATABASE UPDATE: Find and update user document
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,                                    // Find by authenticated user's ID
            {
                name,                                        // Update name
                email,                                       // Update email
                phone,                                       // Update phone
                address                                      // Update address
            },
            { new: true, runValidators: true }              // Return updated document, run schema validation
        );
        
        // USER NOT FOUND CHECK: Ensure user exists
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // DEBUG: Log successful update
        console.log('Customer profile updated successfully:', updatedUser);
        
        // SUCCESS RESPONSE: Return updated user data (excluding sensitive info)
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt                // Account creation date
            }
        });
        
    } catch (error) {
        // ERROR HANDLING: Log error and handle specific cases
        console.error('Error updating customer profile:', error);
        
        // MONGODB DUPLICATE KEY ERROR: Handle email uniqueness constraint
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        
        // GENERIC SERVER ERROR: Return error message
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Change customer password
 * FLOW: Frontend sends passwords → Middleware verifies JWT → Controller validates → Verifies current password → Hashes new password → Updates DB
 */
export const changeCustomerPassword = async (req, res) => {
    try {
        // DEBUG: Log password change start
        console.log('Changing password for customer:', req.user.id);
        
        // EXTRACT passwords from request body
        const { currentPassword, newPassword } = req.body;
        
        // INPUT VALIDATION: Ensure both passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        
        // PASSWORD STRENGTH VALIDATION: Ensure new password meets requirements
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        
        // DATABASE QUERY: Get user document with password field
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // CURRENT PASSWORD VERIFICATION: Compare provided password with stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // NEW PASSWORD HASHING: Create secure hash for new password
        const saltRounds = 10;                              // Number of salt rounds for security
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // DATABASE UPDATE: Update user password with new hash
        await User.findByIdAndUpdate(req.user.id, {
            password: hashedPassword                       // Store hashed password, not plain text
        });
        
        // DEBUG: Log successful password change
        console.log('Customer password changed successfully');
        
        // SUCCESS RESPONSE: Confirm password change
        res.status(200).json({
            success: true,
            message: 'Password changed successfully!'
        });
        
    } catch (error) {
        // ERROR HANDLING: Log error and return server error response
        console.error('Error changing customer password:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get customer statistics
 * FLOW: Frontend requests stats → Middleware verifies JWT → Controller queries orders → Calculates statistics → Returns data
 */
export const getCustomerStats = async (req, res) => {
    try {
        // DEBUG: Log statistics request start
        console.log('Getting statistics for customer:', req.user.id);
        
        // DATABASE QUERY: Get all orders for this customer
        const orders = await Order.find({ 
            customerEmail: req.user.email                  // Filter by authenticated user's email
        });
        
        // CALCULATE BASIC STATISTICS: Process orders data
        const totalOrders = orders.length;                 // Total number of orders
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0); // Total money spent
        const pendingOrders = orders.filter(order => order.status === 'pending').length;     // Pending orders count
        const completedOrders = orders.filter(order => order.status === 'delivered').length; // Completed orders count
        
        // CALCULATE MONTHLY STATISTICS: Filter orders by current month
        const currentMonth = new Date().getMonth();        // Current month (0-11)
        const currentYear = new Date().getFullYear();      // Current year
        const ordersThisMonth = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        }).length;
        
        // BUILD STATISTICS OBJECT: Compile all calculated data
        const stats = {
            orders: {
                total: totalOrders,                        // Total orders count
                pending: pendingOrders,                   // Pending orders count
                completed: completedOrders,                 // Completed orders count
                thisMonth: ordersThisMonth               // Orders this month count
            },
            spending: {
                total: totalSpent,                       // Total amount spent
                average: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0 // Average order value
            },
            memberSince: req.user.createdAt               // Account creation date
        };
        
        // DEBUG: Log calculated statistics
        console.log('Customer statistics calculated:', stats);
        
        // SUCCESS RESPONSE: Return statistics object
        res.status(200).json(stats);
        
    } catch (error) {
        // ERROR HANDLING: Log error and return server error response
        console.error('Error getting customer stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// EXPORT ALL CONTROLLER FUNCTIONS: Make available to routes
export default {
    getCustomerOrders,                    // Get customer's orders
    createCustomerOrder,                  // Create new order
    updateCustomerProfile,                // Update profile information
    changeCustomerPassword,              // Change password
    getCustomerStats                      // Get dashboard statistics
};
