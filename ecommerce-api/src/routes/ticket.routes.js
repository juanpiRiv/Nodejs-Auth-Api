// src/routes/ticket.routes.js
import express from 'express';
import { getTickets, getTicketById, getTicketByCode } from '../controllers/ticket.controller.js';
import passport from 'passport';
import authorize from '../middlewares/authorization.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

const authenticateJWT = isAuthenticated;


router.get('/', authenticateJWT, authorize('admin'), getTickets); // solo admin
router.get('/:tid', authenticateJWT, getTicketById); // usuario dueño o admin
router.get('/by-code/:code', authenticateJWT, getTicketByCode); // buscar por code

export default router;
