import { v4 as uuidv4 } from 'uuid';
import cartService from '../services/cart.service.js';
import ticketService from '../services/ticket.service.js';
import orderService from '../services/order.service.js';
import mpService from '../services/mp.service.js';
import { sendPurchaseEmail } from '../services/email.service.js';
import productRepository from '../repositories/product.repository.js';

const buildPurchasableItems = async (cart) => {
    const availableItems = [];
    const unavailableItems = [];

    for (const item of cart.products) {
        const product = item.product;
        if (!product) {
            unavailableItems.push(item);
            continue;
        }

        if (product.stock >= item.quantity) {
            availableItems.push({
                product: product._id,
                title: product.title,
                quantity: item.quantity,
                unit_price: Number(product.price)
            });
        } else {
            unavailableItems.push(item);
        }
    }

    return { availableItems, unavailableItems };
};

export const createPreference = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartService.getCartById(cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        await cart.populate('products.product');

        if (!cart.products.length) {
            return res.status(400).json({ status: 'error', message: 'El carrito está vacío' });
        }

        const { availableItems, unavailableItems } = await buildPurchasableItems(cart);

        if (!availableItems.length) {
            return res.status(400).json({
                status: 'error',
                message: 'No hay productos con stock disponible para pagar',
                unavailableProducts: unavailableItems.map((item) => item.product?._id || item.product)
            });
        }

        const amount = availableItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
        const order = await orderService.createOrder({
            cartId: cart._id,
            userEmail: req.user.email,
            status: 'pending',
            items: availableItems,
            amount
        });

        const cartForPreference = {
            products: availableItems.map((item) => ({
                quantity: item.quantity,
                product: { title: item.title, price: item.unit_price }
            }))
        };

        const preference = await mpService.createPreference(cartForPreference, req.user, order._id);

        return res.status(201).json({
            status: 'success',
            init_point: preference.init_point,
            preferenceId: preference.id,
            orderId: order._id
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

const reduceStockAtomically = async (item) => {
    const update = await productRepository.model.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
    );

    return update.modifiedCount === 1;
};

const approveOrder = async (order, paymentId) => {
    const existingTicket = await ticketService.getTicketByMpPaymentId(paymentId);
    if (existingTicket) {
        await orderService.updateOrder(order._id, {
            status: 'approved',
            ticketId: existingTicket._id,
            mpPaymentId: String(paymentId),
            processedAt: new Date()
        });
        return existingTicket;
    }

    const purchasedProducts = [];
    const productsNotPurchasedIds = [];

    for (const item of order.items) {
        const reduced = await reduceStockAtomically(item);
        if (reduced) {
            purchasedProducts.push({ product: item.product, quantity: item.quantity });
        } else {
            productsNotPurchasedIds.push(item.product);
        }
    }

    if (!purchasedProducts.length) {
        await orderService.updateOrder(order._id, {
            status: 'rejected',
            mpPaymentId: String(paymentId),
            processedAt: new Date()
        });
        return null;
    }

    const ticket = await ticketService.createTicket({
        code: uuidv4(),
        purchase_datetime: new Date(),
        amount: purchasedProducts.reduce((total, item) => {
            const src = order.items.find((x) => String(x.product) === String(item.product));
            return total + (src.unit_price * src.quantity);
        }, 0),
        purchaser: order.userEmail,
        products: purchasedProducts,
        mpPaymentId: String(paymentId),
        paymentStatus: 'approved'
    });

    await orderService.updateOrder(order._id, {
        status: 'approved',
        ticketId: ticket._id,
        mpPaymentId: String(paymentId),
        processedAt: new Date()
    });

    const cart = await cartService.getCartById(order.cartId);
    if (cart) {
        const purchasedIds = purchasedProducts.map((item) => String(item.product));
        const remainingProducts = cart.products.filter((item) => !purchasedIds.includes(String(item.product)));
        await cartService.updateCart(order.cartId, remainingProducts.map((item) => ({ product: item.product, quantity: item.quantity })));
    }

    return ticket;
};

export const webhook = async (req, res) => {
    try {
        if (!mpService.validateWebhookSignature(req)) {
            return res.status(200).json({ status: 'ignored' });
        }

        const { type, data } = req.body || {};
        if (type !== 'payment' || !data?.id) {
            return res.status(200).json({ status: 'ignored' });
        }

        const payment = await mpService.getPaymentById(data.id);
        const externalReference = payment.external_reference;
        if (!externalReference) {
            return res.status(200).json({ status: 'ignored' });
        }

        const order = await orderService.getOrderByExternalReference(externalReference);
        if (!order) {
            return res.status(200).json({ status: 'ignored' });
        }

        if (payment.status === 'approved') {
            const lockedOrder = await orderService.acquireOrderForProcessing(order._id, payment.id);
            if (!lockedOrder) {
                return res.status(200).json({ status: 'already_processed' });
            }

            const ticket = await approveOrder(lockedOrder, payment.id);
            if (ticket) {
                try {
                    await sendPurchaseEmail(lockedOrder.userEmail, ticket);
                } catch (emailError) {
                    console.error('Error enviando email de compra:', emailError.message);
                }
            }
        }

        if (['rejected', 'cancelled'].includes(payment.status)) {
            await orderService.updateOrder(order._id, {
                status: 'rejected',
                mpPaymentId: String(payment.id),
                processedAt: new Date()
            });
        }

        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('webhook error', error.message);
        return res.status(200).json({ status: 'error_logged' });
    }
};

export const getOrderStatus = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Orden no encontrada' });
        }

        return res.status(200).json({
            status: 'success',
            payload: {
                orderId: order._id,
                paymentStatus: order.status,
                mpPaymentId: order.mpPaymentId,
                ticketId: order.ticketId
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
