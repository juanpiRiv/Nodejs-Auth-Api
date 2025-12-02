import { v4 as uuidv4 } from 'uuid';
import { MercadoPagoConfig, Payment } from "mercadopago";
import cartService from '../services/cart.service.js';
import productService from '../services/product.service.js';
import ticketService from '../services/ticket.service.js';
import userService from '../services/user.service.js';
import { sendPurchaseMessage } from '../services/twilio.service.js';
import { sendPurchaseEmail } from "../services/email.service.js";
import { createPreferenceForCart } from "../services/mercadopago.service.js";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const paymentApi = new Payment(mpClient);

export const startCartPayment = async (req, res) => {
    try {
        const { cid } = req.params;
        const userEmail = req.user?.email;
        const userId = req.user?.id || req.user?._id;

        if (!userEmail) return res.status(401).json({ status: "error", message: "Usuario no autenticado" });

        const cart = await cartService.getCartById(cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        if (!cart.products || cart.products.length === 0) {
            return res.status(400).json({ status: "error", message: "El carrito está vacío" });
        }

        const preference = await createPreferenceForCart(cart, userEmail, userId);
        return res.status(200).json({
            status: "success",
            message: "Preferencia creada",
            preferenceId: preference.id,
            init_point: preference.init_point,
            sandbox_init_point: preference.sandbox_init_point
        });
    } catch (error) {
        console.error("Error al iniciar pago:", error);
        if (error?.status) {
            return res.status(400).json({ status: "error", message: error.message, details: error });
        }
        return res.status(500).json({ status: "error", message: error.message || "Error interno al crear preferencia" });
    }
};

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
        res.json({ status: "success", message: "Producto agregado al carrito de sesión", cartId: cart._id });
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
            return res.status(400).json({ status: "error", message: "Formato inválido de productos" });
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
            return res.status(400).json({ status: "error", message: "Cantidad no válida" });
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
        const userEmail = req.user.email;

        const cart = await cartService.getCartById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        if (cart.products.length === 0) return res.status(400).json({ status: 'error', message: 'El carrito está vacío' });

        let totalAmount = 0;
        const productsMap = new Map();
        const productsNotPurchasedIds = [];

        for (const item of cart.products) {
            const productId = item.product._id;
            const quantityInCart = item.quantity;
            try {
                const productData = await productService.getProductById(productId);
                if (!productData) {
                    productsNotPurchasedIds.push(productId);
                    continue;
                }
                if (productData.stock >= quantityInCart) {
                    const key = String(productId);
                    const existing = productsMap.get(key) || { product: productId, quantity: 0, price: productData.price, title: productData.title };
                    existing.quantity += quantityInCart;
                    existing.price = productData.price;
                    existing.title = productData.title;
                    productsMap.set(key, existing);
                    totalAmount += productData.price * quantityInCart;
                } else {
                    productsNotPurchasedIds.push(productId);
                }
            } catch {
                productsNotPurchasedIds.push(productId);
            }
        }

        const productsToPurchase = Array.from(productsMap.values());
        let newTicket = null;

        if (productsToPurchase.length > 0) {
            for (const item of productsToPurchase) {
                try {
                    await productService.updateProductStock(item.product, -item.quantity);
                } catch {
                    productsNotPurchasedIds.push(item.product);
                }
            }

            const ticketData = {
                code: uuidv4(),
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: userEmail,
                products: productsToPurchase.map(item => ({ product: item.product, quantity: item.quantity }))
            };

            newTicket = await ticketService.createTicket(ticketData);

            if (process.env.ADMIN_PHONE) {
                try { await sendPurchaseMessage(process.env.ADMIN_PHONE, newTicket); } catch {}
            }
            if (req.user?.email) {
                try { await sendPurchaseEmail(req.user.email, newTicket, productsToPurchase); } catch {}
            }

            try {
                const remainingProducts = cart.products.filter(item => productsNotPurchasedIds.includes(item.product._id));
                await cartService.updateCart(cid, remainingProducts.map(p => ({ product: p.product._id, quantity: p.quantity })));
            } catch {}
        }

        res.status(200).json({
            status: 'success',
            message: productsToPurchase.length > 0 ? 'Compra procesada' : 'No se pudieron comprar productos por falta de stock',
            payload: {
                ticket: newTicket ? { _id: newTicket._id, code: newTicket.code, purchase_datetime: newTicket.purchase_datetime, amount: newTicket.amount, purchaser: newTicket.purchaser, products: newTicket.products } : null,
                productsNotPurchased: productsNotPurchasedIds
            }
        });
    } catch (error) {
        console.error(`Error general en purchaseCart para carrito ${req.params.cid}:`, error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor durante la compra.' });
    }
};

export const handleMercadoPagoWebhook = async (req, res) => {
    try {
        const { type, data } = req.body || {};
        const eventType = type || req.query?.type || req.query?.topic;
        // MP envía en query (topic/id) y en body (data.id). Preferimos data.id cuando existe.
        const paymentId = data?.id || req.query?.['data.id'] || req.query?.id;
        // Si no es payment o no hay id, ignorar
        if (eventType !== "payment" || !paymentId) {
            return res.status(200).send("Webhook ignorado");
        }
        // Evitar duplicado cuando llegan dos callbacks (topic=payment y type=payment): procesa solo si no existe ticket
        const existingTicket = await ticketService.getTicketByPaymentId(String(paymentId));
        if (existingTicket) {
            return res.status(200).send("Ticket ya creado para este pago");
        }

        const payment = await paymentApi.get({ id: paymentId });
        if (!payment) return res.status(404).send("Pago no encontrado");
        if (payment.status !== "approved") {
            return res.status(200).send(`Pago con estado ${payment.status}, no se crea ticket`);
        }
        const existingByRef = await ticketService.findExistingForPayment({
            paymentId: String(payment.id),
            preferenceId: payment.preference_id
        });
        if (existingByRef) {
            return res.status(200).send("Ticket ya creado para este pago");
        }

        const cartId = payment.external_reference || payment.metadata?.cartId;
        const payerEmail = payment.payer?.email || payment.metadata?.buyerEmail;
        if (!cartId) return res.status(400).send("Falta external_reference/cartId");

        const cart = await cartService.getCartById(cartId);
        if (!cart || !cart.products?.length) return res.status(404).send("Carrito no encontrado o vacio");

        let totalAmount = 0;
        const productsMap = new Map();
        const productsNotPurchasedIds = [];

        for (const item of cart.products) {
            const productId = item.product._id;
            const quantityInCart = item.quantity;
            try {
                const productData = await productService.getProductById(productId);
                if (!productData) {
                    productsNotPurchasedIds.push(productId);
                    continue;
                }
                if (productData.stock >= quantityInCart) {
                    const key = String(productId);
                    const existing = productsMap.get(key) || { product: productId, quantity: 0, price: productData.price, title: productData.title };
                    existing.quantity += quantityInCart;
                    existing.price = productData.price;
                    existing.title = productData.title;
                    productsMap.set(key, existing);
                    totalAmount += productData.price * quantityInCart;
                } else {
                    productsNotPurchasedIds.push(productId);
                }
            } catch (productError) {
                console.error(`Error al procesar producto ${productId}:`, productError);
                productsNotPurchasedIds.push(productId);
            }
        }

        const productsToPurchase = Array.from(productsMap.values());
        if (!productsToPurchase.length) {
            return res.status(200).send("Sin stock suficiente, no se crea ticket");
        }

        for (const item of productsToPurchase) {
            try {
                await productService.updateProductStock(item.product, -item.quantity);
            } catch (stockError) {
                console.error(`Error al actualizar stock para ${item.product}:`, stockError);
                productsNotPurchasedIds.push(item.product);
            }
        }

        // Email prioritario del usuario de la plataforma: primero por carrito, luego metadata userId/userEmail, luego buyerEmail
        let platformEmail = payment.metadata?.userEmail || null;
        let platformUserId = payment.metadata?.userId ? String(payment.metadata.userId) : null;
        if (!platformEmail || !platformUserId) {
            try {
                const uByCart = await userService.getUserByCartId(cartId);
                platformEmail = platformEmail || uByCart?.email || null;
                platformUserId = platformUserId || uByCart?._id?.toString() || null;
            } catch {}
        }
        if (!platformEmail) {
            platformEmail = payment.metadata?.buyerEmail || payerEmail || null;
        }

        const ticketData = {
            code: uuidv4(),
            purchase_datetime: payment.date_approved ? new Date(payment.date_approved) : new Date(),
            amount: totalAmount,
            purchaser: platformEmail || payerEmail || "sin-email",
            user: platformUserId,
            products: productsToPurchase.map(item => ({
                product: item.product,
                quantity: item.quantity
            })),
            payment_id: String(payment.id),
            preference_id: payment.preference_id,
            external_reference: payment.external_reference,
            payment_status: payment.status,
            currency: payment.currency_id,
            payment_method: payment.payment_type_id || payment.payment_method_id,
            installments: payment.installments,
            payer_email: payerEmail,
            receipt_url: payment.point_of_interaction?.transaction_data?.ticket_url || payment.transaction_details?.external_resource_url
        };

        const createdTicket = await ticketService.createTicket(ticketData);

        const emailTarget = platformEmail || payerEmail;
        if (emailTarget) {
            const itemsForEmail = productsToPurchase.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price
            }));
            try {
                await sendPurchaseEmail(emailTarget, createdTicket, itemsForEmail);
            } catch (emailError) {
                console.error("Error al enviar correo de compra (webhook):", emailError);
            }
        }

        try {
            const remainingProducts = cart.products.filter(item => productsNotPurchasedIds.includes(item.product._id));
            await cartService.updateCart(cartId, remainingProducts.map(p => ({ product: p.product._id, quantity: p.quantity })));
        } catch (cartUpdateError) {
            console.error(`Error al actualizar carrito ${cartId} tras webhook:`, cartUpdateError);
        }

        return res.status(200).send("Ticket creado desde webhook");
    } catch (error) {
        console.error("Error en webhook de Mercado Pago:", error);
        return res.status(500).send("Error interno");
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

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }

        const updatedCart = await cartService.deleteProductFromCart(cid, pid);
        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Callbacks de redirección desde Mercado Pago para evitar 404 en back_urls
export const paymentSuccess = (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Pago aprobado",
        preference_id: req.query?.preference_id,
        external_reference: req.query?.external_reference,
        collection_id: req.query?.collection_id,
        payment_type: req.query?.payment_type
    });
};

export const paymentFailure = (req, res) => {
    return res.status(400).json({
        status: "error",
        message: "Pago rechazado o fallido",
        preference_id: req.query?.preference_id,
        external_reference: req.query?.external_reference,
        collection_id: req.query?.collection_id,
        payment_type: req.query?.payment_type
    });
};

export const paymentPending = (req, res) => {
    return res.status(202).json({
        status: "pending",
        message: "Pago en revisión o pendiente",
        preference_id: req.query?.preference_id,
        external_reference: req.query?.external_reference,
        collection_id: req.query?.collection_id,
        payment_type: req.query?.payment_type
    });
};
