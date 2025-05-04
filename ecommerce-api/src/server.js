import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';
import { engine } from 'express-handlebars';
import path from 'path';
import session from 'express-session';
import methodOverride from 'method-override'; 
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(session({
    secret: 'miclavedeprueba',  // Cambia esto en producción
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 3600 // Tiempo de vida de la sesión en segundos (1 hora)
    })
}));
// Registrar el helper "multiply" para Handlebars
const hbs = engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        multiply: (a, b) => a * b,
        eq: (a, b) => a === b,  
        json: (context) => JSON.stringify(context, null, 2)  
    }
});


app.engine('handlebars', hbs);
app.set('view engine', 'handlebars');
app.set('views', path.resolve('src/views'));


// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);




// Conexión a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};





// Iniciar 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
});
