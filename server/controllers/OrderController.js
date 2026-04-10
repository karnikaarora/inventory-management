import Order from '../models/order.js';
import Product from '../models/product.js';

/**
 * Create new order
 */
export const createOrder = async (req, res) => {
    try {
        console.log('=== ORDER CREATION WITH STOCK ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            paymentMethod,
            deliveryDate,
            priority = 'medium'
        } = req.body;

        console.log('Creating new order:', { customerName, customerEmail, itemsCount: items?.length });

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one item is required' 
            });
        }

        // Use totalAmount from request or calculate if not provided
        const finalTotalAmount = totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('Final total amount:', finalTotalAmount);

        // Check stock availability and reduce stock for each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`Processing item ${i + 1}:`, item);
            
            const product = await Product.findOne({ name: item.name });
            console.log(`Found product:`, product);
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Product "${item.name}" not found` 
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
                });
            }
            
            // Update stock
            await Product.findByIdAndUpdate(product._id, { 
                $inc: { stock: -item.quantity } 
            });
            console.log(`Stock updated for "${item.name}": -${item.quantity}`);
        }

        // Create order
        const newOrder = new Order({
            orderNumber: `ORD-${Date.now()}`,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            totalAmount: finalTotalAmount,
            paymentMethod,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
            priority,
            status: 'pending'
        });

        await newOrder.save();
        console.log('Order created successfully:', newOrder);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully! Stock has been updated.',
            data: newOrder
        });

    } catch (error) {
        console.error('=== ERROR CREATING ORDER ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating order', 
            error: error.message
        });
    }
};

/**
 * Get all orders
 */
export const getOrders = async (req, res) => {
    try {
        console.log('Fetching all orders...');
        
        const orders = await Order.find({}).sort({ createdAt: -1 });
        console.log('Orders found:', orders.length);
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update order status
 */
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log('Updating order status:', { id, status });
        
        // Validate status
        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { 
                status,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        console.log('Order status updated successfully:', updatedOrder);
        
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully!',
            data: updatedOrder
        });
        
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete order
 */
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Deleting order:', id);
        
        const deletedOrder = await Order.findByIdAndDelete(id);
        
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        console.log('Order deleted successfully:', deletedOrder);
        
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully!',
            data: deletedOrder
        });
        
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (req, res) => {
    try {
        console.log('Fetching order statistics...');
        
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
        
        // Get recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        // Calculate total revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        
        const stats = {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            recentOrders,
            totalRevenue
        };
        
        console.log('Order stats calculated:', stats);
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting order stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
