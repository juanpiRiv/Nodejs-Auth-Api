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

// Rutas generales 
router.get('/', authenticateJWT, getAllCarts); //  Solo usuarios autenticados ven todos los carritos
router.post('/', authenticateJWT, createCart); // Solo usuarios autenticados crean carritos
router.get('/:cid', authenticateJWT, getCartById); //  Solo usuarios autenticados ven su carrito

// Rutas para modificar carrito  rol 'user'
router.post('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), addProductToCart);
router.put('/:cid', authenticateJWT, authorize('user'), updateCart); 
router.put('/:cid/products/:pid', authenticateJWT, authorize('user'), validateBody(addProductToCartSchema), updateProductQuantity); // También validamos aquí, ya que se espera 'quantity'
router.delete('/:cid/products/:pid', authenticateJWT, authorize('user'), deleteProductFromCart);
router.delete('/:cid', authenticateJWT, authorize('user'), deleteCart); 
router.post('/add-product', authenticateJWT, authorize('user'), addProductSessionCart); // Añadir a carrito de sesión

router.post('/:cid/purchase', authenticateJWT, authorize('user'), purchaseCart); 

export default router;
