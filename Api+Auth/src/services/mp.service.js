import crypto from 'crypto';
import { config } from '../config/config.js';

const MP_API_BASE = 'https://api.mercadopago.com';

const parseSignatureHeader = (signatureHeader) => {
    const parsed = {};
    if (!signatureHeader) {
        return parsed;
    }

    for (const token of signatureHeader.split(',')) {
        const [key, value] = token.trim().split('=');
        parsed[key] = value;
    }

    return parsed;
};

class MPService {
    async createPreference(cart, user, orderId) {
        const items = cart.products.map((item) => ({
            title: item.product.title,
            quantity: Number(item.quantity),
            currency_id: 'ARS',
            unit_price: Number(item.product.price)
        }));

        const body = {
            items,
            payer: {
                email: user.email
            },
            back_urls: {
                success: config.mpSuccessUrl,
                failure: config.mpFailureUrl,
                pending: config.mpPendingUrl
            },
            notification_url: config.mpNotificationUrl,
            external_reference: String(orderId)
        };

        const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`MercadoPago preference error: ${response.status} ${errorBody}`);
        }

        const result = await response.json();

        return {
            id: result.id,
            init_point: result.init_point
        };
    }

    async getPaymentById(mpPaymentId) {
        const response = await fetch(`${MP_API_BASE}/v1/payments/${mpPaymentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${config.mpAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`MercadoPago payment error: ${response.status} ${errorBody}`);
        }

        return response.json();
    }

    validateWebhookSignature(req) {
        if (!config.mpWebhookSecret) {
            return true;
        }

        const signatureHeader = req.headers['x-signature'];
        const requestId = req.headers['x-request-id'];
        const dataId = req.body?.data?.id;

        if (!signatureHeader || !requestId || !dataId) {
            return false;
        }

        const parsed = parseSignatureHeader(signatureHeader);
        if (!parsed.ts || !parsed.v1) {
            return false;
        }

        const manifest = `id:${dataId};request-id:${requestId};ts:${parsed.ts};`;
        const hash = crypto
            .createHmac('sha256', config.mpWebhookSecret)
            .update(manifest)
            .digest('hex');

        return hash === parsed.v1;
    }
}

export default new MPService();
