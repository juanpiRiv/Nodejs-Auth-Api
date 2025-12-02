import express from 'express';
import methodOverride from 'method-override';
import {
    createCart,
    getCartById,
    addProductToCart,
    updateCart,
    updateProductQuantity,
    deleteProductFromCart,
    deleteCart,
    addProductSessionCart,
    purchaseCart,
    getAllCarts
} from '../controllers/cart.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { addProductToCartSchema } from '../validations/cart.validation.js';

const authenticateJWT = isAuthenticated;
const router = express.Router();

router.use(methodOverride('_method'));

/**
 * @openapi
 * /api/carts:
 *   get:
 *     summary: Obtener todos los carritos
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carritos
 *   post:
 *     summary: Crear un carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Carrito creado
 */
router.get('/', authenticateJWT, getAllCarts);
router.post('/', authenticateJWT, createCart);

/**
 * @openapi
 * /api/carts/{cid}:
 *   get:
 *     summary: Obtener carrito por ID
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito
 *       404:
 *         description: Carrito no encontrado
 *   put:
 *     summary: Reemplazar productos del carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *       404:
 *         description: Carrito no encontrado
 *   delete:
 *     summary: Vaciar/eliminar carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *       404:
 *         description: Carrito no encontrado
 */
router.get('/:cid', authenticateJWT, getCartById);
router.put('/:cid', authenticateJWT, authorize('user'), updateCart);
router.delete('/:cid', authenticateJWT, authorize('user'), deleteCart);

// Carrito de sesión
router.post('/add-product', authenticateJWT, authorize('user'), addProductSessionCart);

/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Producto agregado
 *   put:
 *     summary: Actualizar cantidad de un producto en el carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */
router.post('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), addProductToCart);
router.put('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), updateProductQuantity);

/**
 * @openapi
 * /api/carts/{cid}/product/{pid}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete('/:cid/product/:pid', authenticateJWT, authorize('user'), deleteProductFromCart);

/**
 * @openapi
 * /api/carts/{cid}/purchase:
 *   post:
 *     summary: Comprar carrito (flujo interno sin Mercado Pago)
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compra procesada
 */
router.post('/:cid/purchase', authenticateJWT, authorize('user'), purchaseCart);

export default router;
