import cartService from '../services/cart.service.js';
import productService from '../services/product.service.js';
import purchaseService, { PurchaseError } from '../services/purchase.service.js';
import { sendPurchaseMessage } from '../services/twilio.service.js';
import { sendPurchaseEmail } from "../services/email.service.js";

export const createCart = async (req, res) => {
    try {
        const { selectedProducts } = req.body;
        let productsWithQuantities = [];

        if (selectedProducts && selectedProducts.length > 0) {
            const productIds = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];
            productsWithQuantities = productIds.map(productId => ({
                product: productId,
                quantity: Number(req.body[`quantity_${productId}`]) || 1
            }));
        }

        const newCart = await cartService.createCart({ products: productsWithQuantities });
        req.session.cartId = newCart._id;
        res.status(201).json({ status: 'success', message: 'Carrito creado', cartId: newCart._id });
    } catch (error) {
        console.error("Error en createCart:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const addProductSessionCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ status: "error", message: "Faltan datos" });
        }

        let cart = await cartService.getCartById(req.session.cartId);
        if (!cart) {
            cart = await cartService.createCart({ products: [] });
            req.session.cartId = cart._id;
        }

        const product = await productService.getProductById(productId);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        await cartService.addProductToCart(cart._id, product._id, Number(quantity));
        res.json({ status: "success", message: "Producto agregado al carrito de sesion", cartId: cart._id });
    } catch (error) {
        console.error("Error en addProductSessionCart:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getCartById = async (req, res) => {
    try {
        const cart = await cartService.getCartById(req.params.cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        res.json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;
        const cart = await cartService.addProductToCart(cid, pid, quantity);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        res.json({ status: "success", cart });
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ status: "error", message: "Formato invalido de productos" });
        }
        const updatedCart = await cartService.updateCart(cid, products);
        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }
        res.json({ status: "success", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        let { quantity } = req.body;
        quantity = parseInt(quantity, 10);
        if (isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ status: "error", message: "Cantidad no valida" });
        }
        const cart = await cartService.updateProductQuantity(cid, pid, quantity);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }
        res.json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const deleteCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartService.deleteCart(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }
        res.json({ status: "success", message: "Carrito vaciado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const userEmail = req.user?.email;
        const userId = req.user?.id || req.user?._id;

        const { ticket, productsToPurchase, productsNotPurchasedIds } = await purchaseService.processCartPurchase({
            cartId: cid,
            purchaserEmail: userEmail,
            userId
        });

        if (!productsToPurchase.length) {
            return res.status(200).json({
                status: 'success',
                message: 'No se pudieron comprar productos por falta de stock',
                payload: { ticket: null, productsNotPurchased: productsNotPurchasedIds }
            });
        }

        if (process.env.ADMIN_PHONE && ticket) {
            try { await sendPurchaseMessage(process.env.ADMIN_PHONE, ticket); } catch {}
        }
        if (userEmail && ticket) {
            try { await sendPurchaseEmail(userEmail, ticket, productsToPurchase); } catch {}
        }

        return res.status(200).json({
            status: 'success',
            message: 'Compra procesada',
            payload: {
                ticket: ticket ? {
                    _id: ticket._id,
                    code: ticket.code,
                    purchase_datetime: ticket.purchase_datetime,
                    amount: ticket.amount,
                    purchaser: ticket.purchaser,
                    products: ticket.products
                } : null,
                productsNotPurchased: productsNotPurchasedIds
            }
        });
    } catch (error) {
        const statusCode = error instanceof PurchaseError ? error.status : 500;
        console.error(`Error general en purchaseCart para carrito ${req.params.cid}:`, error);
        res.status(statusCode).json({ status: 'error', message: error.message || 'Error interno del servidor durante la compra.' });
    }
};

export const getAllCarts = async (req, res) => {
    try {
        const carts = await cartService.getAllCarts();
        res.json({ status: "success", carts });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartService.getCartById(cid);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        const productExists = cart.products.some(({ product }) => {
            const productId = product?._id ?? product;
            return productId && productId.toString() === pid;
        });

        if (!productExists) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }

        const updatedCart = await cartService.deleteProductFromCart(cid, pid);
        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
