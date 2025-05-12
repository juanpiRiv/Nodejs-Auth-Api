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

// Middleware pre-save para asociar un carrito nuevo si el usuario no tiene uno
//  varia según tu lógica de creación de carritos
userSchema.pre('save', async function(next) {
    if (this.isNew && !this.cart) {
        // Lógica para crear un carrito nuevo y asignarlo
        // const newCart = await cartManager.createCart(); // Ejemplo
        // this.cart = newCart._id;
    }
    next();
});


const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
