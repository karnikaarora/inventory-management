import Order from '../models/order.js';
import Product from '../models/product.js';
import User from '../models/user.js';

/**
 * 📊 ANALYTICS CONTROLLER
 * 
 * Purpose: Provide real-time business intelligence for admin dashboard
 * Features: Sales trends, low stock alerts, top products analysis
 * Technology: MongoDB aggregation pipelines for optimal performance
 * 
 * 🎯 BUSINESS VALUE:
 * - Real-time decision making
 * - Inventory optimization
 * - Sales performance tracking
 * - Revenue insights
 */

/**
 * 📈 Get Sales Trends Data
 * 
 * 🎯 PURPOSE: Calculate and return comprehensive sales analytics
 * 📊 FEATURES: Monthly trends, daily patterns, revenue summaries
 * ⏰ TIMEFRAME: Last 12 months + Last 30 days
 * 🔥 REAL-TIME: Direct database queries - no caching
 * 
 * 📱 FRONTEND USE: Line charts, bar charts, summary cards
 * 🎨 VISUALIZATION: Recharts library integration
 */
export const getSalesTrends = async (req, res) => {
    try {
        console.log('📊 Getting sales trends...');
        
        // 🗓️ MONTHLY SALES ANALYSIS
        // Calculate sales data for each month in the last 12 months
        // This helps identify seasonal patterns and growth trends
        const monthlySales = await Order.aggregate([
            {
                // 🎯 FILTER: Only orders from last 12 months
                $match: {
                    createdAt: { 
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                    }
                }
            },
            {
                // 📊 GROUP: Aggregate orders by year and month
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },    // Extract year from date
                        month: { $month: "$createdAt" }   // Extract month from date
                    },
                    // 💰 TOTAL SALES: Sum of all order amounts for this month
                    totalSales: { $sum: "$totalAmount" },
                    // 📦 ORDER COUNT: Number of orders placed this month
                    orderCount: { $sum: 1 },
                    // 📈 AVERAGE ORDER VALUE: Average amount per order
                    avgOrderValue: { $avg: "$totalAmount" }
                }
            },
            {
                // 🔄 SORT: Arrange data chronologically (oldest to newest)
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        
        // 📅 DAILY SALES ANALYSIS  
        // Calculate detailed daily sales for the last 30 days
        // This helps identify recent patterns and daily performance
        const dailySales = await Order.aggregate([
            {
                // 🎯 FILTER: Only orders from last 30 days
                $match: {
                    createdAt: { 
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                // 📊 GROUP: Aggregate orders by year, month, and day
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },      // Extract year
                        month: { $month: "$createdAt" },     // Extract month  
                        day: { $dayOfMonth: "$createdAt" }  // Extract day
                    },
                    // 💰 TOTAL SALES: Sum of all order amounts for this day
                    totalSales: { $sum: "$totalAmount" },
                    // 📦 ORDER COUNT: Number of orders placed this day
                    orderCount: { $sum: 1 }
                }
            },
            {
                // 🔄 SORT: Arrange data chronologically by day
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);
        
        // 💰 OVERALL REVENUE SUMMARY
        // Calculate complete business metrics since inception
        // This provides the big picture of business performance
        const totalRevenue = await Order.aggregate([
            {
                // 📊 GROUP: Aggregate ALL orders (no filtering)
                $group: {
                    _id: null, // Group all documents together
                    // 💰 TOTAL REVENUE: Sum of all order amounts ever
                    totalRevenue: { $sum: "$totalAmount" },
                    // 📦 TOTAL ORDERS: Count of all orders ever placed
                    totalOrders: { $sum: 1 },
                    // 📈 AVERAGE ORDER VALUE: Overall average order size
                    avgOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);
        
        // 🎨 DATA FORMATTING FOR FRONTEND
        // Transform database results into chart-ready format
        // This ensures compatibility with Recharts library
        
        // 📊 Format monthly data: "2024-01", "2024-02", etc.
        const formattedMonthlySales = monthlySales.map(item => ({
            // 📅 Date format: YYYY-MM for chart x-axis
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            // 💰 Sales amount for this month
            sales: item.totalSales,
            // 📦 Number of orders this month
            orders: item.orderCount,
            // 📈 Average order value (rounded for display)
            avgOrderValue: Math.round(item.avgOrderValue)
        }));
        
        // 📅 Format daily data: "2024-01-15", "2024-01-16", etc.
        const formattedDailySales = dailySales.map(item => ({
            // 📅 Date format: YYYY-MM-DD for chart x-axis
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            // 💰 Sales amount for this day
            sales: item.totalSales,
            // 📦 Number of orders this day
            orders: item.orderCount
        }));
        
        // 📦 FINAL DATA PACKAGE
        // Combine all analytics into single response object
        // This structure matches frontend expectations
        const stats = {
            // 📊 12 months of sales data for line charts
            monthlySales: formattedMonthlySales,
            // 📅 30 days of sales data for bar charts
            dailySales: formattedDailySales,
            // 💰 Overall business summary for dashboard cards
            summary: totalRevenue[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                avgOrderValue: 0
            }
        };
        
        console.log('📊 Sales trends calculated:', stats);
        
        // ✅ SUCCESS RESPONSE
        // Send formatted data to frontend with success status
        res.status(200).json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        // ❌ ERROR HANDLING
        // Log error details and send error response
        console.error('❌ Error getting sales trends:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * ⚠️ Get Low Stock Alerts
 * 
 * 🎯 PURPOSE: Identify products that need immediate attention
 * 📦 FEATURES: Low stock warnings, out of stock alerts
 * ⚠️ THRESHOLDS: < 10 units = low stock, = 0 units = out of stock
 * 🔥 REAL-TIME: Current inventory status from database
 * 
 * 📱 FRONTEND USE: Alert cards, warning indicators, reorder suggestions
 * 🎨 VISUALIZATION: Red/yellow color coding for urgency
 */
export const getLowStockAlerts = async (req, res) => {
    try {
        console.log('⚠️ Getting low stock alerts...');
        
        // 🔴 LOW STOCK PRODUCTS
        // Find products with stock less than 10 units
        // These need attention but aren't critical yet
        const lowStockProducts = await Product.find({
            stock: { $lt: 10 } // Less than 10 units
        }).sort({ stock: 1 }); // Sort by stock level (lowest first)
        
        // 🚨 OUT OF STOCK PRODUCTS  
        // Find products with zero stock
        // These are critical and need immediate action
        const outOfStockProducts = await Product.find({
            stock: { $eq: 0 } // Exactly 0 units
        });
        
        // 📦 ALERTS PACKAGE
        // Combine all stock alerts into structured response
        const alerts = {
            // ⚠️ Products that need reordering soon
            lowStock: lowStockProducts,
            // 🚨 Products that are completely out of stock
            outOfStock: outOfStockProducts,
            // 📊 Summary counts for dashboard indicators
            totalLowStock: lowStockProducts.length,
            totalOutOfStock: outOfStockProducts.length
        };
        
        console.log('⚠️ Low stock alerts:', alerts);
        
        // ✅ SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            data: alerts
        });
        
    } catch (error) {
        // ❌ ERROR HANDLING
        console.error('❌ Error getting low stock alerts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * 🥇 Get Top Products
 * 
 * 🎯 PURPOSE: Identify best performing products
 * 📊 FEATURES: Sales volume, revenue ranking, performance metrics
 * 🔥 REAL-TIME: Based on actual order data
 * 📈 BUSINESS VALUE: Inventory decisions, marketing focus
 * 
 * 📱 FRONTEND USE: Leaderboards, product performance cards
 * 🎨 VISUALIZATION: Ranked lists with revenue/sales metrics
 */
export const getTopProducts = async (req, res) => {
    try {
        console.log('🥇 Getting top products...');
        
        // 📊 TOP PRODUCTS ANALYSIS
        // Aggregate order data to find best performing products
        // This uses order items to calculate actual sales performance
        const topProducts = await Order.aggregate([
            {
                // 📦 UNWIND: Deconstruct order items array
                // Each item becomes a separate document for analysis
                $unwind: "$items"
            },
            {
                // 📊 GROUP: Aggregate by product name
                $group: {
                    _id: "$items.name", // Group by product name
                    // 📦 TOTAL SOLD: Sum of all quantities sold
                    totalSold: { $sum: "$items.quantity" },
                    // 💰 TOTAL REVENUE: Sum of (price × quantity) for all orders
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                // 🏆 SORT: Rank by sales volume (highest first)
                $sort: { totalSold: -1 }
            },
            {
                // 🎯 LIMIT: Get top 10 products only
                $limit: 10
            }
        ]);
        
        console.log('🥇 Top products calculated:', topProducts);
        
        // ✅ SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            data: topProducts
        });
        
    } catch (error) {
        // ❌ ERROR HANDLING
        console.error('❌ Error getting top products:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};
