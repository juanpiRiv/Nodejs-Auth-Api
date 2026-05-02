import mongoose from 'mongoose';

const orderCollection = 'orders';

const orderSchema = new mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    mpPaymentId: {
        type: String,
        default: null,
        index: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tickets',
        default: null
    },
    processedAt: {
        type: Date,
        default: null
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            title: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit_price: { type: Number, required: true }
        }
    ],
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const orderModel = mongoose.model(orderCollection, orderSchema);

export default orderModel;
