import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },  // ✅ Referencia a Product
            quantity: { type: Number, required: true, default: 1 }
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
