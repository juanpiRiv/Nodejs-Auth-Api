import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const preferenceApi = new Preference(client);

export const createPreferenceForCart = async (cart, buyerEmail, userId) => {
    if (!cart?.products?.length) {
        throw new Error("Carrito vacio o invalido");
    }

    const items = cart.products.map(item => {
        const priceNum = Number(item?.product?.price);
        const qty = Number(item?.quantity);

        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            throw new Error("Precio invalido en un producto del carrito");
        }
        if (!Number.isInteger(qty) || qty <= 0) {
            throw new Error("Cantidad invalida en un producto del carrito");
        }

        return {
            title: item?.product?.title ?? "Producto sin titulo",
            description: item?.product?.description ?? "",
            quantity: qty,
            unit_price: priceNum,
            currency_id: "ARS"
        };
    });

    const baseUrl = process.env.BASE_URL; // ej: url https publica (ngrok)

    if (!baseUrl || !baseUrl.startsWith("https://")) {
        throw new Error("BASE_URL no configurada o no es https");
    }

    const body = {
        items,
        // Forzamos el payer al correo de la plataforma (usuario autenticado)
        payer: {
            email: buyerEmail
        },
        external_reference: String(cart._id),
        notification_url: `${baseUrl}/api/carts/payment/webhook`, // confirmacion server-to-server
        back_urls: {
            success: `${baseUrl}/api/carts/payment/success`,
            failure: `${baseUrl}/api/carts/payment/failure`,
            pending: `${baseUrl}/api/carts/payment/pending`
        },
        auto_return: "approved",
        binary_mode: true,
        metadata: {
            cartId: String(cart._id),
            buyerEmail,
            userEmail: buyerEmail,
            userId: userId ? String(userId) : null
        }
    };

    return preferenceApi.create({ body });
};
