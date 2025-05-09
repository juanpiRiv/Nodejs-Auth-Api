import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'; // Corregido nombre de archivo
import authorize from '../middlewares/authorization.middleware.js';
import passport from 'passport';
import { validateBody } from '../middlewares/validate.middleware.js';
import { productSchema } from '../validations/product.validation.js';


const authenticateJWT = passport.authenticate('jwt', { session: false });

const router = express.Router();

// Rutas públicas o que requieren solo autenticación básica 
router.get('/', getProducts); 
router.get('/:pid', getProductById); 

// Rutas CRUD para administradores
router.post('/', authenticateJWT, authorize('admin'), validateBody(productSchema), addProduct);
router.put('/:pid', authenticateJWT, authorize('admin'), updateProduct); // Consider adding validation for update if needed
router.delete('/:pid', authenticateJWT, authorize('admin'), deleteProduct);

export default router;
