import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: false },
    customerAddress: { type: String, required: false },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    priority: { 
        type: String, 
        enum: ['high', 'medium', 'low'], 
        default: 'medium' 
    },
    paymentMethod: { 
        type: String, 
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery', 'Bank Transfer'], 
        required: false 
    },
    deliveryDate: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("orders", orderSchema);
export default Order;
