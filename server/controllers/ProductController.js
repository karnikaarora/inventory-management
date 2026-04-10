import Product from '../models/product.js';

/**
 * Add Product API
 */
export const addProduct = async (req, res) => {
    try {
        console.log('Adding product with data:', req.body);
        
        const { name, category, supplier, price, stock } = req.body;
        
        // Validate input
        if (!name || !category || !supplier || !price || !stock) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Create new product
        const newProduct = new Product({
            name,
            category,
            supplier,
            price: parseFloat(price),
            stock: parseInt(stock)
        });
        
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);
        
        res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            data: newProduct
        });
        
    } catch (error) {
        console.error('Error adding product:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Product with this name already exists' });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation error', details: messages });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get all products
 */
export const getProducts = async (req, res) => {
    try {
        console.log('Fetching all products...');
        
        const products = await Product.find({}).sort({ createdAt: -1 });
        console.log('Products found:', products.length);
        
        res.status(200).json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, supplier, price, stock } = req.body;
        
        // Validate input
        if (!name || !category || !supplier || !price || !stock) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                category,
                supplier,
                price: parseFloat(price),
                stock: parseInt(stock)
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully!',
            data: updatedProduct
        });
        
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully!',
            data: deletedProduct
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
