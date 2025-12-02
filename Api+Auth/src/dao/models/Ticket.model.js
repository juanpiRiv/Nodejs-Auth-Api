import mongoose from 'mongoose';

const ticketCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],
    // Datos del pago en Mercado Pago para auditoria y trazabilidad
    payment_id: { type: String, index: true, unique: true, sparse: true },
    preference_id: { type: String, index: true },
    external_reference: { type: String, index: true }, // normalmente el cartId
    payment_status: { type: String },
    currency: { type: String },
    payment_method: { type: String }, // ej: payment_type_id (card, account_money, etc)
    installments: { type: Number },
    payer_email: { type: String },
    receipt_url: { type: String }
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
