// src/routes/ticket.routes.js
import express from 'express';
import { getTickets, getTicketById, getTicketByCode, createTicket } from '../controllers/ticket.controller.js'; // Asumiendo que createTicket existe
import passport from 'passport';
import authorize from '../middlewares/authorization.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { ticketSchema } from '../validations/ticket.validation.js';

const router = express.Router();

const authenticateJWT = isAuthenticated;

// Ruta para crear un nuevo ticket (ej. después de una compra exitosa, o para testing)
// La autorización podría ser 'user' si un usuario puede generar su propio ticket,
// o podría no tener autorización específica si se llama internamente.
// Por ahora, la dejaré con autenticación básica.
router.post('/', authenticateJWT, validateBody(ticketSchema), createTicket);

router.get('/', authenticateJWT, authorize('admin'), getTickets); // solo admin
router.get('/:tid', authenticateJWT, getTicketById); // usuario dueño o admin
router.get('/by-code/:code', authenticateJWT, getTicketByCode); // buscar por code

export default router;
