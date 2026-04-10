import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // connectDB ki jagah mongoose use karenge
import authRoutes from './routes/auth.js'; 
import categoryRoutes from './routes/category.js';
import supplierRoutes from './routes/supplier.js';
import productRoutes from './routes/product.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/order.js';
import dashboardRoutes from './routes/dashboard.js';
import customerRoutes from './routes/customer.js';
import favoriteRoutes from './routes/favorite.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION (Directly in index.js)
const dbURL = "mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db?retryWrites=true&w=majority";

mongoose.connect(dbURL)
    .then(() => console.log("✅ MongoDB Atlas (Cloud) Connected directly!"))
    .catch(err => console.log("❌ Connection Error:", err));

// ROUTES
app.use('/api/auth', authRoutes); // Login/Register routes yahan se chalenge
app.use('/api/category', categoryRoutes); // Category routes
app.use('/api/supplier', supplierRoutes); // Supplier routes
app.use('/api/product', productRoutes); // Product routes
app.use('/api/user', userRoutes); // User routes
app.use('/api/order', orderRoutes); // Order routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes
app.use('/api/customer', customerRoutes); // Customer routes
app.use('/api/favorite', favoriteRoutes); // Favorites routes
app.use('/api/analytics', analyticsRoutes); // Analytics routes

// Purane routes (addItem, getItems) bhi yahan niche rakh sakte ho
app.get('/', (req, res) => {
    res.send("Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});