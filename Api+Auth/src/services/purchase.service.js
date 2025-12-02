import { v4 as uuidv4 } from 'uuid';
import cartService from './cart.service.js';
import productService from './product.service.js';
import ticketService from './ticket.service.js';
import userService from './user.service.js';

export class PurchaseError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
        this.name = 'PurchaseError';
    }
}

class PurchaseService {
    async getCartOrThrow(cartId) {
        const cart = await cartService.getCartById(cartId);
        if (!cart) {
            throw new PurchaseError('Carrito no encontrado', 404);
        }
        if (!cart.products || cart.products.length === 0) {
            throw new PurchaseError('El carrito esta vacio', 400);
        }
        return cart;
    }

    async buildPurchaseItems(cart) {
        let totalAmount = 0;
        const productsMap = new Map();
        const productsNotPurchasedIds = [];

        for (const item of cart.products) {
            const productId = item.product?._id || item.product;
            const productKey = String(productId);
            const quantityInCart = Number(item.quantity) || 0;
            try {
                const productData = await productService.getProductById(productId);
                if (quantityInCart > 0 && productData.stock >= quantityInCart) {
                    const existing = productsMap.get(productKey) || { product: productId, quantity: 0, price: productData.price, title: productData.title };
                    existing.quantity += quantityInCart;
                    existing.price = productData.price;
                    existing.title = productData.title;
                    productsMap.set(productKey, existing);
                    totalAmount += productData.price * quantityInCart;
                } else {
                    productsNotPurchasedIds.push(productKey);
                }
            } catch (error) {
                productsNotPurchasedIds.push(productKey);
            }
        }

        return {
            productsToPurchase: Array.from(productsMap.values()),
            productsNotPurchasedIds,
            totalAmount
        };
    }

    async updateStockForProducts(productsToPurchase, productsNotPurchasedIds) {
        for (const item of productsToPurchase) {
            try {
                await productService.updateProductStock(item.product, -item.quantity);
            } catch {
                const key = String(item.product);
                if (!productsNotPurchasedIds.includes(key)) {
                    productsNotPurchasedIds.push(key);
                }
            }
        }
    }

    async updateCartWithFailures(cartId, cart, productsNotPurchasedIds) {
        try {
            const remainingProducts = cart.products.filter(item =>
                productsNotPurchasedIds.includes(String(item.product?._id || item.product))
            );
            await cartService.updateCart(
                cartId,
                remainingProducts.map(p => ({ product: p.product._id || p.product, quantity: p.quantity }))
            );
        } catch {
            // La actualizacion de carrito no debe romper el flujo principal
        }
    }

    async createTicketSafe(ticketData) {
        try {
            return await ticketService.createTicket(ticketData);
        } catch (error) {
            if (error?.code === 11000 && error?.keyPattern?.payment_id) {
                const existing = await ticketService.getTicketByPaymentId(ticketData.payment_id);
                if (existing) return existing;
            }
            throw error;
        }
    }

    async processCartPurchase({ cartId, purchaserEmail, userId }) {
        const cart = await this.getCartOrThrow(cartId);
        const { productsToPurchase, productsNotPurchasedIds, totalAmount } = await this.buildPurchaseItems(cart);

        if (!productsToPurchase.length) {
            return { ticket: null, productsToPurchase, productsNotPurchasedIds, totalAmount, cartId };
        }

        await this.updateStockForProducts(productsToPurchase, productsNotPurchasedIds);

        const successfulProducts = productsToPurchase.filter(item => !productsNotPurchasedIds.includes(String(item.product)));
        if (!successfulProducts.length) {
            await this.updateCartWithFailures(cartId, cart, productsNotPurchasedIds);
            return { ticket: null, productsToPurchase: [], productsNotPurchasedIds, totalAmount: 0, cartId };
        }

        const finalAmount = successfulProducts.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);

        const ticketData = {
            code: uuidv4(),
            purchase_datetime: new Date(),
            amount: finalAmount,
            purchaser: purchaserEmail,
            user: userId,
            products: successfulProducts.map(item => ({ product: item.product, quantity: item.quantity }))
        };

        const ticket = await this.createTicketSafe(ticketData);
        await this.updateCartWithFailures(cartId, cart, productsNotPurchasedIds);

        return { ticket, productsToPurchase: successfulProducts, productsNotPurchasedIds, totalAmount: finalAmount, cartId };
    }

    async resolveUserContext(cartId, payment) {
        let platformEmail = payment.metadata?.userEmail || null;
        let platformUserId = payment.metadata?.userId ? String(payment.metadata.userId) : null;
        const payerEmail = payment.payer?.email || payment.metadata?.buyerEmail || null;

        if (!platformEmail || !platformUserId) {
            try {
                const userByCart = await userService.getUserByCartId(cartId);
                platformEmail = platformEmail || userByCart?.email || null;
                platformUserId = platformUserId || userByCart?._id?.toString() || null;
            } catch {
                // contexto de usuario no es critico para seguir
            }
        }
        if (!platformEmail) {
            platformEmail = payment.metadata?.buyerEmail || payerEmail || null;
        }

        return { platformEmail, platformUserId, payerEmail };
    }

    async processMercadoPagoPayment({ payment }) {
        const paymentId = String(payment.id);
        const cartId = payment.external_reference || payment.metadata?.cartId;
        if (!cartId) {
            throw new PurchaseError('Falta external_reference/cartId en el pago', 400);
        }

        const existingTicket = await ticketService.getTicketByPaymentId(paymentId);
        if (existingTicket) {
            return { ticket: existingTicket, alreadyProcessed: true, cartId };
        }

        const existingByRef = await ticketService.findExistingForPayment({
            paymentId,
            preferenceId: payment.preference_id,
            externalReference: payment.external_reference
        });
        if (existingByRef) {
            return { ticket: existingByRef, alreadyProcessed: true, cartId };
        }

        const cart = await this.getCartOrThrow(cartId);
        const existingByCart = await ticketService.getTicketsByExternalReference(cartId);
        if (existingByCart?.length) {
            return { ticket: existingByCart[0], alreadyProcessed: true, cartId };
        }
        const { productsToPurchase, productsNotPurchasedIds, totalAmount } = await this.buildPurchaseItems(cart);

        if (!productsToPurchase.length) {
            return { ticket: null, productsToPurchase, productsNotPurchasedIds, totalAmount, cartId };
        }

        await this.updateStockForProducts(productsToPurchase, productsNotPurchasedIds);

        const paidAmount = Number(payment.transaction_amount);
        const successfulProducts = productsToPurchase.filter(item => !productsNotPurchasedIds.includes(String(item.product)));
        if (!successfulProducts.length) {
            await this.updateCartWithFailures(cartId, cart, productsNotPurchasedIds);
            return { ticket: null, productsToPurchase: [], productsNotPurchasedIds, totalAmount: 0, cartId };
        }

        let finalAmount = successfulProducts.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
        if (finalAmount <= 0 && Number.isFinite(paidAmount) && paidAmount > 0) {
            finalAmount = paidAmount;
        }
        if (Number.isFinite(paidAmount) && finalAmount > 0 && paidAmount !== finalAmount) {
            return { amountMismatch: true, paidAmount, totalAmount: finalAmount, cartId };
        }

        const { platformEmail, platformUserId, payerEmail } = await this.resolveUserContext(cartId, payment);
        const resolvedUserId = platformUserId || payment.metadata?.userId || payment.metadata?.user_id || null;
        const resolvedPurchaser = platformEmail || payment.metadata?.userEmail || payerEmail || 'sin-email';

        const ticketData = {
            code: uuidv4(),
            purchase_datetime: payment.date_approved ? new Date(payment.date_approved) : new Date(),
            amount: finalAmount,
            purchaser: resolvedPurchaser,
            user: resolvedUserId,
            products: successfulProducts.map(item => ({ product: item.product, quantity: item.quantity })),
            payment_id: paymentId,
            preference_id: payment.preference_id,
            external_reference: payment.external_reference,
            payment_status: payment.status,
            currency: payment.currency_id,
            payment_method: payment.payment_type_id || payment.payment_method_id,
            installments: payment.installments,
            payer_email: payerEmail,
            receipt_url: payment.point_of_interaction?.transaction_data?.ticket_url || payment.transaction_details?.external_resource_url
        };

        const ticket = await this.createTicketSafe(ticketData);
        await this.updateCartWithFailures(cartId, cart, productsNotPurchasedIds);

        return {
            ticket,
            productsToPurchase: successfulProducts,
            productsNotPurchasedIds,
            totalAmount: finalAmount,
            cartId,
            emailTarget: platformEmail || payerEmail
        };
    }
}

export default new PurchaseService();


