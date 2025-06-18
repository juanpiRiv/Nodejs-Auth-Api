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

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     summary: Crear un nuevo ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       201:
 *         description: Ticket creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Error al crear el ticket
 */
router.post('/', authenticateJWT, validateBody(ticketSchema), createTicket);

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     summary: Obtener todos los tickets (Solo Admin)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tickets obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateJWT, authorize('admin'), getTickets); // solo admin

/**
 * @openapi
 * /api/tickets/{tid}:
 *   get:
 *     summary: Obtener un ticket por ID
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tid
 *         required: true
 *         description: ID del ticket a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket no encontrado
 */
router.get('/:tid', authenticateJWT, getTicketById); // usuario dueño o admin

/**
 * @openapi
 * /api/tickets/by-code/{code}:
 *   get:
 *     summary: Obtener un ticket por código
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: Código del ticket a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket no encontrado
 */
router.get('/by-code/:code', authenticateJWT, getTicketByCode); // buscar por code

export default router;
