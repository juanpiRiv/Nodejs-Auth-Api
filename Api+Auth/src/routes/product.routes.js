import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'; // Corregido nombre de archivo
import authorize from '../middlewares/authorization.middleware.js';
import passport from 'passport';
import { validateBody } from '../middlewares/validate.middleware.js';
import { productSchema } from '../validations/product.validation.js';


const authenticateJWT = passport.authenticate('jwt', { session: false });

const router = express.Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Listar productos
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Lista de productos obtenida con éxito
 */
router.get('/', getProducts); 
/**
 * @openapi
 * /api/products/{pid}:
 *   get:
 *     summary: Lista un producto por ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto obtenido con éxito
 */
router.get('/:pid', getProductById); 

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crear un producto
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Clavos 999
 *               stock:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: integer
 *                 example: 3
 *               description:
 *                 type: string
 *                 example: clavos
 *               category:
 *                 type: string
 *                 example: Herramientas
 *               code:
 *                 type: string
 *                 example: clav9
 *               thumbnail:
 *                 type: string
 *                 example: []
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Producto creado con éxito
 */
router.post('/', authenticateJWT, authorize('admin'), validateBody(productSchema), addProduct);
/**
 * @openapi
 * /api/products/{pid}:
 *   put:
 *     summary: Modifica un producto
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto a modificar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: MODIFICACION REALIZADA...!!!
 *               price:
 *                 type: integer
 *                 example: 7000
 *     responses:
 *       200:
 *         description: Producto modificado con éxito
 */
router.put('/:pid', authenticateJWT, authorize('admin'), validateBody(productSchema), updateProduct); // Consider adding validation for update if needed
/**
 * @openapi
 * /api/products/{pid}:
 *   delete:
 *     summary: Elimina un producto
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID del producto a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Producto eliminado con éxito
 */
router.delete('/:pid', authenticateJWT, authorize('admin'), deleteProduct);

export default router;
