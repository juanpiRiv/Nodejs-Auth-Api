import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'; // Corregido nombre de archivo
import authorize from '../middlewares/authorization.middleware.js';
import passport from 'passport'; // Asumiendo que usas Passport

// Middleware de autenticación (ajusta 'jwt' según tu estrategia)
const authenticateJWT = passport.authenticate('jwt', { session: false });

const router = express.Router();

// Rutas públicas o que requieren solo autenticación básica (si aplica)
router.get('/', getProducts); // Podría requerir autenticación general
router.get('/:pid', getProductById); // Podría requerir autenticación general

// Rutas CRUD protegidas para administradores
router.post('/', authenticateJWT, authorize('admin'), addProduct);
router.put('/:pid', authenticateJWT, authorize('admin'), updateProduct);
router.delete('/:pid', authenticateJWT, authorize('admin'), deleteProduct);

export default router;
