import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';
import { createPreference, getOrderStatus, webhook } from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/payments/create-preference/{cid}:
 *   post:
 *     summary: Crea una preferencia de MercadoPago para Checkout Pro
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Preference creada
 */
router.post('/create-preference/:cid', isAuthenticated, authorize('user'), createPreference);

/**
 * @openapi
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook público de MercadoPago
 *     tags: [Payments]
 *     description: Endpoint público. MercadoPago envía body con type y data.id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: payment
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1234567890"
 *     responses:
 *       200:
 *         description: Siempre devuelve 200 para evitar reintentos innecesarios
 */
router.post('/webhook', webhook);

/**
 * @openapi
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Consulta estado de una orden de pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la orden
 */
router.get('/order/:orderId', isAuthenticated, getOrderStatus);

export default router;
