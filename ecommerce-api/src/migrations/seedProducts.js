import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model.js';

dotenv.config();


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

const seedProducts = async () => {
    await connectDB();


    const products = [
        { title: "Laptop Gamer", description: "Laptop potente", code: "LAPTOP1", price: 1500, stock: 10, category: "Tecnología", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Teclado Mecánico", description: "Teclado RGB", code: "TECLADO1", price: 100, stock: 20, category: "Accesorios", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Mouse Gamer", description: "Mouse con DPI ajustable", code: "MOUSE1", price: 50, stock: 30, category: "Accesorios", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Monitor 27 Pulgadas", description: "Monitor Full HD", code: "MONITOR1", price: 300, stock: 15, category: "Tecnología", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Silla Gamer", description: "Silla ergonómica", code: "SILLA1", price: 250, stock: 5, category: "Muebles", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Celular Samsung", description: "Smartphone 5G", code: "CEL1", price: 800, stock: 12, category: "Telefonía", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Smartwatch", description: "Reloj inteligente", code: "WATCH1", price: 200, stock: 8, category: "Accesorios", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Auriculares Bluetooth", description: "Sonido Hi-Fi", code: "AUDIO1", price: 120, stock: 18, category: "Audio", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Disco SSD 1TB", description: "Alta velocidad", code: "SSD1", price: 150, stock: 10, category: "Almacenamiento", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Tarjeta Gráfica RTX 3080", description: "Para gaming extremo", code: "GPU1", price: 1200, stock: 7, category: "Hardware", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Router WiFi 6", description: "Alta velocidad de conexión", code: "ROUTER1", price: 90, stock: 10, category: "Redes", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Impresora Multifunción", description: "Impresión y escaneo", code: "PRINT1", price: 180, stock: 6, category: "Oficina", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Parlantes Bluetooth", description: "Sonido envolvente", code: "SPEAKER1", price: 130, stock: 10, category: "Audio", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Cámara Web HD", description: "Videollamadas en alta calidad", code: "CAM1", price: 70, stock: 15, category: "Accesorios", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Microfono Profesional", description: "Para streaming", code: "MIC1", price: 110, stock: 10, category: "Audio", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Luz LED RGB", description: "Iluminación para setup", code: "LED1", price: 40, stock: 25, category: "Accesorios", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Fuente de Poder 750W", description: "Certificación 80 Plus Gold", code: "PSU1", price: 90, stock: 5, category: "Hardware", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Mesa Gamer", description: "Espacio para setup completo", code: "MESA1", price: 250, stock: 3, category: "Muebles", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Tarjeta de Sonido USB", description: "Calidad de audio mejorada", code: "SOUND1", price: 60, stock: 10, category: "Audio", thumbnails: ["https://via.placeholder.com/150"] },
        { title: "Ventiladores RGB", description: "Refrigeración para PC", code: "FAN1", price: 50, stock: 20, category: "Hardware", thumbnails: ["https://via.placeholder.com/150"] }
    ];

    try {
        await Product.insertMany(products);
        console.log('✅ 20 Productos insertados correctamente');
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error insertando productos:', error.message);
    }
};


seedProducts();
