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
const authenticateJWT = passport.authenticate('jwt', { session: false });

const router = express.Router();

router.use(methodOverride('_method')); 

// Rutas generales (podrían requerir autenticación básica)
router.get('/', authenticateJWT, getAllCarts); // Ejemplo: Solo usuarios autenticados ven todos los carritos? (Ajustar según necesidad)
router.post('/', authenticateJWT, createCart); // Ejemplo: Solo usuarios autenticados crean carritos?
router.get('/:cid', authenticateJWT, getCartById); // Ejemplo: Solo usuarios autenticados ven su carrito?

// Rutas para modificar carrito (requieren rol 'user')
router.post('/:cid/products/:pid', authenticateJWT, authorize('user'), addProductToCart);
router.put('/:cid', authenticateJWT, authorize('user'), updateCart); // Actualizar carrito completo (quizás solo admin?) - REVISAR LÓGICA
router.put('/:cid/products/:pid', authenticateJWT, authorize('user'), updateProductQuantity);
router.delete('/:cid/products/:pid', authenticateJWT, authorize('user'), deleteProductFromCart);
router.delete('/:cid', authenticateJWT, authorize('user'), deleteCart); // Eliminar carrito (quizás solo admin?) - REVISAR LÓGICA
router.post('/add-product', authenticateJWT, authorize('user'), addProductSessionCart); // Añadir a carrito de sesión

// Ruta de compra (requiere rol 'user') - Se implementará la lógica específica más adelante
router.post('/:cid/purchase', authenticateJWT, authorize('user'), purchaseCart); // Renombrado de checkout a purchase
// router.get('/:cid/checkout', checkoutCart); // Eliminada ruta GET para checkout/purchase, usar POST

// Se elimina la ruta POST /:cid/checkout original ya que se reemplaza por /purchase
// router.post('/:cid/checkout', checkoutCart);

export default router;
