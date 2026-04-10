import express from 'express';
import { 
    addToFavorites, 
    removeFromFavorites, 
    getFavorites, 
    checkFavorite 
} from '../controllers/FavoriteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add product to favorites
router.post('/add', authenticateToken, addToFavorites);

// Remove product from favorites
router.delete('/remove/:productId', authenticateToken, removeFromFavorites);

// Get user's favorites
router.get('/', authenticateToken, getFavorites);

// Check if product is in favorites
router.get('/check/:productId', authenticateToken, checkFavorite);

export default router;
