import mongoose from 'mongoose';

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts' 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

userSchema.pre('save', async function(next) {
    if (this.isNew && !this.cart) {
        const cartRepository = require('../../repositories/cart.repository').default;
        const newCart = await cartRepository.create({});
        this.cart = newCart._id;
    }
    next();
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
