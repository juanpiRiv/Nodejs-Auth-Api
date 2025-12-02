import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago";
import cartService from '../services/cart.service.js';
import purchaseService, { PurchaseError } from '../services/purchase.service.js';
import { sendPurchaseEmail } from "../services/email.service.js";
import { createPreferenceForCart } from "../services/mercadopago.service.js";
import ticketService from "../services/ticket.service.js";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const paymentApi = new Payment(mpClient);
const merchantOrderApi = new MerchantOrder(mpClient);

export const startCartPayment = async (req, res) => {
    try {
        const { cid } = req.params;
        const userEmail = req.user?.email;
        const userId = req.user?.id || req.user?._id;

        if (!userEmail) return res.status(401).json({ status: "error", message: "Usuario no autenticado" });

        // Evitar pagos múltiples sobre el mismo carrito si ya tiene ticket
        const existingTickets = await ticketService.getTicketsByExternalReference(cid);
        if (existingTickets?.length) {
            return res.status(409).json({ status: "error", message: "El carrito ya tiene una compra registrada" });
        }

        const cart = await cartService.getCartById(cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        if (!cart.products || cart.products.length === 0) {
            return res.status(400).json({ status: "error", message: "El carrito esta vacio" });
        }

        // Validar stock antes de crear preferencia
        const outOfStock = [];
        for (const item of cart.products) {
            const prod = item.product;
            const pid = prod?._id || prod;
            try {
                const productData = await (await import('../services/product.service.js')).default.getProductById(pid);
                if (productData.stock < Number(item.quantity || 0)) {
                    outOfStock.push({ product: pid, requested: item.quantity, available: productData.stock });
                }
            } catch (err) {
                outOfStock.push({ product: pid, error: err?.message || 'Error al validar stock' });
            }
        }
        if (outOfStock.length) {
            return res.status(409).json({ status: "error", message: "Carrito sin stock suficiente", details: outOfStock });
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

export const handleMercadoPagoWebhook = async (req, res) => {
    try {
        const { type, data } = req.body || {};
        let eventType = type || req.query?.type || req.query?.topic;
        let paymentId = data?.id || req.query?.['data.id'] || req.query?.id;

        if ((!paymentId && (eventType === "merchant_order" || req.query?.topic === "merchant_order")) || eventType === "merchant_order") {
            const merchantOrderId = data?.id || req.query?.id;
            if (!merchantOrderId) {
                return res.status(200).send("Webhook merchant_order sin id");
            }
            try {
                const merchantOrder = await merchantOrderApi.get({ id: merchantOrderId });
                const approvedPayment = merchantOrder.payments?.find(p => p.status === "approved") || merchantOrder.payments?.[0];
                paymentId = approvedPayment?.id;
                eventType = "payment";
            } catch (moError) {
                console.warn("merchant_order ignorado por id invalido", { merchantOrderId, error: moError?.message });
                return res.status(200).send("Webhook merchant_order sin payment procesable");
            }
        }

        if (eventType !== "payment" || !paymentId) {
            return res.status(200).send("Webhook ignorado");
        }

        const payment = await paymentApi.get({ id: paymentId });
        if (!payment) return res.status(404).send("Pago no encontrado");
        if (payment.status !== "approved") {
            return res.status(200).send(`Pago con estado ${payment.status}, no se crea ticket`);
        }

        const purchaseResult = await purchaseService.processMercadoPagoPayment({ payment });

        if (purchaseResult.alreadyProcessed) {
            return res.status(200).send("Ticket ya creado para este pago/carrito");
        }
        if (purchaseResult.amountMismatch) {
            console.warn(`Monto pagado ${purchaseResult.paidAmount} difiere del total del carrito ${purchaseResult.totalAmount} para carrito ${purchaseResult.cartId}`);
            return res.status(200).send("Monto de pago no coincide con el total del carrito");
        }
        if (!purchaseResult.productsToPurchase?.length) {
            return res.status(200).send("Sin stock suficiente, no se crea ticket");
        }

        const emailTarget = purchaseResult.emailTarget;
        if (emailTarget && purchaseResult.ticket) {
            const itemsForEmail = purchaseResult.productsToPurchase.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price
            }));
            try {
                await sendPurchaseEmail(emailTarget, purchaseResult.ticket, itemsForEmail);
            } catch (emailError) {
                console.error("Error al enviar correo de compra (webhook):", emailError);
            }
        }

        return res.status(200).send("Ticket creado desde webhook");
    } catch (error) {
        const statusCode = error instanceof PurchaseError ? error.status : 500;
        console.error("Error en webhook de Mercado Pago:", error);
        return res.status(statusCode).send(error.message || "Error interno");
    }
};

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
        message: "Pago en revision o pendiente",
        preference_id: req.query?.preference_id,
        external_reference: req.query?.external_reference,
        collection_id: req.query?.collection_id,
        payment_type: req.query?.payment_type
    });
};
