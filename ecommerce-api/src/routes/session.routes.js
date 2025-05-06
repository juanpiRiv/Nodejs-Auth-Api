import express from 'express';
import { login, register, current, logout } from '../controllers/session.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/current', isAuthenticated, current);

router.get('/logout', logout);

export default router;
