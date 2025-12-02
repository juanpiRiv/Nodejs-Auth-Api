import express from 'express';
import methodOverride from 'method-override';
import {
    startCartPayment,
    handleMercadoPagoWebhook,
    paymentSuccess,
    paymentFailure,
    paymentPending
} from '../controllers/payments.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();
const authenticateJWT = isAuthenticated;

router.use(methodOverride('_method'));

/**
 * @openapi
 * /api/carts/{cid}/pay:
 *   post:
 *     summary: Iniciar pago de carrito (Mercado Pago)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Preferencia creada
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Carrito no encontrado
 */
router.post('/:cid/pay', authenticateJWT, authorize('user'), startCartPayment);
router.post('/:cid/payment/start', authenticateJWT, authorize('user'), startCartPayment);

/**
 * @openapi
 * /api/carts/payment/webhook:
 *   post:
 *     summary: Webhook de Mercado Pago
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Procesado o ignorado
 */
router.post('/payment/webhook', handleMercadoPagoWebhook);
router.get('/payment/success', paymentSuccess);
router.get('/payment/failure', paymentFailure);
router.get('/payment/pending', paymentPending);

export default router;
