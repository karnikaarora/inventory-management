import express from 'express';
import { login, register } from '../controllers/AuthController.js';   

// If a user sends a POST request to /login,
//  immediately send them to the login function inside the Controller.

const router = express.Router();
router.post('/login', login);
router.post('/register', register);

export default router;