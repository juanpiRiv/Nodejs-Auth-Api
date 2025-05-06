import mongoose from 'mongoose';

const ticketCollection = 'tickets'; // Nombre de la colección para tickets

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
        // Considerar agregar un default con una función para generar códigos únicos, ej: default: () => generateUniqueCode()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: { // Correo del usuario que realiza la compra
        type: String,
        required: true
        // Podría ser una referencia al usuario si prefieres:
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'users',
        // required: true
    },
    products: [ // Agregar el array de productos
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ]
    // Puedes añadir otros campos si los necesitas, como los productos no comprados,
    // pero el requisito mínimo es este.
});

// Función placeholder para generar código único (deberías implementar una lógica real)
// function generateUniqueCode() {
//     // Lógica para generar un código único, por ejemplo, usando UUID o una combinación de timestamp y aleatorio
//     return `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
// }

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
