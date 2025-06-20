import dotenv from 'dotenv';
import path from 'path';
import { __dirname } from './config/utils.js';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import mongoose from 'mongoose';

import productsRouter from './routes/product.routes.js';
import cartsRouter from './routes/cart.routes.js';
import usersRouter from './routes/user.routes.js';
import sessionsRouter from './routes/session.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import session from 'express-session';
import methodOverride from 'method-override';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import httpLogger from './middlewares/httpLogger.middleware.js';
import notFoundHandler from './middlewares/notFoundHandler.middleware.js'; // Importar el notFoundHandler
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 8080;

const options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de la API',
            version: '1.0.0',
            description: 'Documentación de la API del proyecto'
        },
    },
    apis: ['./src/routes/*.js'], // Rutas a los archivos de las rutas
};

const specs = swaggerJsdoc(options);

app.use(session({
    secret: 'miclavedeprueba',  // Cambia en producción
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 3600 // Tiempo de vida de la sesión en segundos (1 hora)
    })
}));
initializePassport();
app.use(passport.initialize());
app.use(passport.session());


// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(httpLogger); // Registrar el httpLogger ANTES de las rutas

// Swagger route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter); 
app.use('/api/sessions', sessionsRouter);
app.use('/api/tickets', ticketRouter);
// app.use('/', viewsRouter); // Rutas de vistas

// Middleware para manejar rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware de manejo de errores global (debe ser el último)
app.use(errorHandler);


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

export default app;
