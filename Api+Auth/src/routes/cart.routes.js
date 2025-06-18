import express from 'express';
import methodOverride from 'method-override';
import {
    createCart, getCartById, addProductToCart, updateCart,
    updateProductQuantity, deleteProductFromCart, deleteCart,
    addProductSessionCart, purchaseCart, getAllCarts // Renombrado checkoutCart a purchaseCart
} from '../controllers/cart.controller.js'; // Corregido nombre de archivo
import authorize from '../middlewares/authorization.middleware.js';
import passport from 'passport'; // Asumiendo que usas Passport
// Middleware de autenticación (ajusta 'jwt' según tu estrategia)
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
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carritos obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64d8f2b6c4b3a7b2a9b8f0a1
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product:
 *                           type: string
 *                           example: 64d8f2b6c4b3a7b2a9b8f0a2
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *   post:
 *     summary: Crear un nuevo carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Carrito creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrito creado con éxito
 */
router.get('/', authenticateJWT, getAllCarts); //  Solo usuarios autenticados ven todos los carritos
/**
 * @openapi
 * /api/carts/{cid}:
 *   get:
 *     summary: Obtener un carrito por ID
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 64d8f2b6c4b3a7b2a9b8f0a1
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         example: 64d8f2b6c4b3a7b2a9b8f0a2
 *                       quantity:
 *                         type: integer
 *                         example: 2
 */
router.post('/', authenticateJWT, createCart); // Solo usuarios autenticados crean carritos
router.get('/:cid', authenticateJWT, getCartById); //  Solo usuarios autenticados ven su carrito
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   post:
 *     summary: Agregar un producto al carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto agregado al carrito con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto agregado al carrito con éxito
 */
/**
 * @openapi
 * /api/carts/{cid}:
 *   put:
 *     summary: Actualizar un carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 64d8f2b6c4b3a7b2a9b8f0a2
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Carrito actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrito actualizado con éxito
 */
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   put:
 *     summary: Actualizar la cantidad de un producto en el carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad de producto actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cantidad de producto actualizada con éxito
 */
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   delete:
 *     summary: Eliminar un producto del carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto eliminado del carrito con éxito
 */
/**
 * @openapi
 * /api/carts/{cid}:
 *   delete:
 *     summary: Eliminar un carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrito eliminado con éxito
 */
/**
 * @openapi
 * /api/carts/add-product:
 *   post:
 *     summary: Agrega un producto al carrito de sesión
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64d8f2b6c4b3a7b2a9b8f0a2
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto agregado al carrito de sesión con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto agregado al carrito de sesión
 */
router.post('/add-product', authenticateJWT, authorize('user'), addProductSessionCart); // Añadir a carrito de sesión
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   post:
 *     summary: Agrega un producto a un carrito específico
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto agregado al carrito con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto agregado al carrito con éxito
 */
router.post('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), addProductToCart);
/**
 * @openapi
 * /api/carts/{cid}:
 *   put:
 *     summary: Modifica un carrito completo
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 66d932007434e6329ab2aeba
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *     responses:
 *       200:
 *         description: Carrito modificado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrito modificado con éxito
 */
router.put('/:cid', authenticateJWT, authorize('user'), updateCart); 
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   put:
 *     summary: Modifica la cantidad de un producto en el carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad de producto modificada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cantidad de producto modificada con éxito
 */
router.put('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), updateProductQuantity); // También validamos aquí, ya que se espera 'quantity'
/**
 * @openapi
 * /api/carts/{cid}/products/{pid}:
 *   delete:
 *     summary: Elimina un producto del carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto eliminado del carrito con éxito
 */
router.delete('/:cid/product/:pid', authenticateJWT, authorize('user'), deleteProductFromCart);
/**
 * @openapi
 * /api/carts/{cid}:
 *   delete:
 *     summary: Elimina un carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrito eliminado con éxito
 */
router.delete('/:cid', authenticateJWT, authorize('user'), deleteCart); 

/**
 * @openapi
 * /api/carts/{cid}/purchase:
 *   post:
 *     summary: Comprar carrito
 *     tags:
 *       - Carts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID del carrito a comprar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compra realizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Compra realizada con éxito
 */
router.post('/:cid/purchase', authenticateJWT, authorize('user'), purchaseCart); 

export default router;
