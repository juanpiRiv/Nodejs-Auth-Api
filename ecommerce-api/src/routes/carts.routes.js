import express from 'express';
import methodOverride from 'method-override';
import { 
    createCart, getCartById, addProductToCart, updateCart, 
    updateProductQuantity, deleteProductFromCart, deleteCart, 
    addProductSessionCart, checkoutCart, getAllCarts
} from '../controllers/carts.controller.js';

const router = express.Router();

router.use(methodOverride('_method')); 

router.get('/', getAllCarts);
router.post('/', createCart);
router.get('/:cid', getCartById);
router.post('/:cid/products/:pid', addProductToCart);
router.put('/:cid', updateCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.delete('/:cid/products/:pid', deleteProductFromCart);
router.delete('/:cid', deleteCart);
router.post('/add-product', addProductSessionCart);

router.post('/:cid/checkout', checkoutCart);
router.get('/:cid/checkout', checkoutCart);

export default router;
