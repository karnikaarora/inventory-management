import Favorite from '../models/favorite.js';
import Product from '../models/product.js';

/**
 * Add product to favorites
 */
export const addToFavorites = async (req, res) => {
    try {
        console.log('Adding to favorites:', req.user.id);
        
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required' 
            });
        }
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        // Check if already in favorites
        const existingFavorite = await Favorite.findOne({
            userId: req.user.id,
            productId: productId
        });
        
        if (existingFavorite) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product already in favorites' 
            });
        }
        
        // Add to favorites
        const favorite = new Favorite({
            userId: req.user.id,
            productId: productId,
            productName: product.name,
            productPrice: product.price,
            productCategory: product.category,
            productImage: product.image || ''
        });
        
        await favorite.save();
        console.log('Added to favorites:', favorite);
        
        res.status(201).json({
            success: true,
            message: 'Product added to favorites!',
            favorite
        });
        
    } catch (error) {
        console.error('Error adding to favorites:', error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product already in favorites' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * Remove product from favorites
 */
export const removeFromFavorites = async (req, res) => {
    try {
        console.log('Removing from favorites:', req.user.id);
        
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required' 
            });
        }
        
        const favorite = await Favorite.findOneAndDelete({
            userId: req.user.id,
            productId: productId
        });
        
        if (!favorite) {
            return res.status(404).json({ 
                success: false, 
                message: 'Favorite not found' 
            });
        }
        
        console.log('Removed from favorites:', favorite);
        
        res.status(200).json({
            success: true,
            message: 'Product removed from favorites!',
            favorite
        });
        
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * Get user's favorites
 */
export const getFavorites = async (req, res) => {
    try {
        console.log('Getting favorites for user:', req.user.id);
        
        const favorites = await Favorite.find({ userId: req.user.id })
            .sort({ addedAt: -1 })
            .populate('productId', 'stock image');
        
        console.log('Found favorites:', favorites.length);
        
        res.status(200).json(favorites);
        
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * Check if product is in favorites
 */
export const checkFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required' 
            });
        }
        
        const favorite = await Favorite.findOne({
            userId: req.user.id,
            productId: productId
        });
        
        res.status(200).json({
            isFavorite: !!favorite,
            favoriteId: favorite?._id
        });
        
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

export default {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavorite
};
