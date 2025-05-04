import express from 'express';
import Product from '../dao/models/Product.model.js'; // Corregida la ruta del modelo de producto
// import Cart from '../models/Cart.model.js'; // Ya no se usa directamente aquí
import cartService from '../services/cart.service.js'; // Importar cartService

const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/products');
});
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "", category = "", sort = "" } = req.query;
        const filter = search
            ? {
                $or: [
                    { category: { $regex: search, $options: "i" } },
                    { title: { $regex: search, $options: "i" } },
                    { status: search.toLowerCase() === "disponible" ? true : false }
                ]
            }
            : {};
        // podrías combinarlo 
        if (category) {
            // puedes añadir la condición directamente
            filter.category = { $regex: category, $options: "i" };
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        const products = await Product.paginate(filter, options);

        console.log("📌 Datos enviados a Handlebars:", products.docs);

        res.render('products', {
            title: 'Productos',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}&limit=${limit}&sort=${sort}&search=${search}&category=${category}` : null,
            nextLink: products.hasNextPage ? `/products?page=${products.nextPage}&limit=${limit}&sort=${sort}&search=${search}&category=${category}` : null,
            search,
            category,
            sort,
            limit
        });
    } catch (error) {
        console.error("❌ Error en GET /products:", error); // Log detallado del error
        res.status(500).send('Error interno al cargar los productos. Intente nuevamente más tarde.'); // Mensaje más informativo al usuario
    }
});



router.get('/cart', async (req, res) => {
    try {
        if (!req.session.cartId) {
            // Si no hay cartId en sesión, renderiza carrito vacío
            return res.render('cart', { title: "Carrito de Compras", cart: null, products: [] }); // Pasar cart como null y products vacío
        }

        // Usar cartService para obtener el carrito por ID (asumiendo que getCartById ya popula los productos)
        const cart = await cartService.getCartById(req.session.cartId);

        if (!cart) {
            // Si el carrito no se encuentra en la BD (quizás fue eliminado), limpiar sesión y renderizar vacío
            req.session.cartId = null; // Opcional: limpiar ID inválido de la sesión
            return res.render('cart', { title: "Carrito de Compras", cart: null, products: [] }); // Pasar cart como null y products vacío
        }

        // Asegurarse de que la plantilla reciba los productos correctamente
        // El servicio ya debería poblarlos, pero verificamos la estructura
        const products = cart.products || [];

        res.render('cart', { title: "Carrito de Compras", cart, products }); // Pasar cart y products
    } catch (error) {
        console.error("❌ Error en GET /cart:", error);
        res.status(500).send('Error interno al cargar el carrito. Intente nuevamente más tarde.');
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).send('Producto no encontrado');

        res.render('productDetail', { title: product.title, product });
    } catch (error) {
        console.error(`❌ Error en GET /products/${req.params.pid}:`, error);
        res.status(500).send('Error interno al cargar el detalle del producto. Intente nuevamente más tarde.');
    }
});

router.get('/carts/:cid', async (req, res) => { // Esta ruta parece redundante con /cart si se usa la sesión, pero la dejamos por si se accede por URL directa
    try {
        const cid = req.params.cid;
        // Usar cartService también aquí por consistencia
        const cart = await cartService.getCartById(cid);
        if (!cart) return res.status(404).render('error', { message: 'Carrito no encontrado' });

        // Asegurarse de pasar los productos a la plantilla
        const products = cart.products || [];
        // Renderiza la vista 'cart' pasando el carrito y los productos
        res.render('cart', { title: `Carrito ${cid}`, cart, products }); // Pasar cart y products
    } catch (error) {
        console.error(`❌ Error en GET /carts/${req.params.cid}:`, error);
        // No hay vista 'error', enviar texto plano
        res.status(500).send('Error interno al cargar el carrito especificado. Intente nuevamente más tarde.');
    }
});


export default router;
