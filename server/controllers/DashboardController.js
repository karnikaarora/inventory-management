import Supplier from '../models/supplier.js';
import Product from '../models/product.js';
import User from '../models/user.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard statistics...');
        
        // Get total counts
        const totalSuppliers = await Supplier.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        
        // Get recent counts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSuppliers = await Supplier.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const recentProducts = await Product.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const stats = {
            suppliers: {
                total: totalSuppliers,
                recent: recentSuppliers
            },
            products: {
                total: totalProducts,
                recent: recentProducts
            },
            users: {
                total: totalUsers,
                recent: recentUsers
            },
            orders: {
                total: 0, // Will implement when orders API is ready
                recent: 0
            }
        };
        
        console.log('Dashboard stats calculated:', stats);
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get supplier statistics specifically
 */
export const getSupplierStats = async (req, res) => {
    try {
        console.log('Fetching supplier statistics...');
        
        const totalSuppliers = await Supplier.countDocuments();
        
        // Get recent suppliers (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSuppliers = await Supplier.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const stats = {
            total: totalSuppliers,
            recent: recentSuppliers
        };
        
        console.log('Supplier stats calculated:', stats);
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting supplier stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default {
    getDashboardStats,
    getSupplierStats
};
