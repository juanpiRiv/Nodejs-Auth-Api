import cartService from '../services/cart.service.js';
import productService from '../services/product.service.js'; // Importar productService
import orderService from '../services/order.service.js'; // Importar orderService


export const createCart = async (req, res) => {
    try {
        console.log("📥 Datos recibidos en createCart:", req.body);

        const { selectedProducts } = req.body;


        let productsWithQuantities = [];

        if (selectedProducts && selectedProducts.length > 0) {
            const productIds = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];
            productsWithQuantities = productIds.map(productId => ({
                product: productId,
                quantity: Number(req.body[`quantity_${productId}`]) || 1
            }));
        }


        console.log("🛒 Productos que se guardarán en el carrito:", productsWithQuantities);


        const newCart = await cartService.createCart({ products: productsWithQuantities });

        req.session.cartId = newCart._id;
        console.log("✅ Carrito creado con ID:", newCart._id);

        res.redirect(`/carts/${newCart._id}`);
    } catch (error) {
        console.error("❌ Error en createCart:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const addProductSessionCart = async (req, res) => {
    try {
        console.log("📥 Datos recibidos en addProductSessionCart:", req.body);

        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            console.error("❌ Error: Faltan datos en la petición");
            return res.status(400).json({ status: "error", message: "Faltan datos" });
        }

        let cart;
        cart = await cartService.getCartById(req.session.cartId);
        if (!cart) {
            console.log("🛒 No existe carrito en la sesión. Creando uno nuevo...");
            cart = await cartService.createCart({ products: [] });
            req.session.cartId = cart._id;
            console.log("✅ Nuevo carrito creado:", cart._id);
        }

        console.log("🔍 Carrito antes de agregar productos:", JSON.stringify(cart, null, 2));

        // Validar que el producto exista y agregarlo
        const product = await productService.getProductById(productId); // Obtener producto una sola vez
        if (!product) {
            console.error("❌ Error: Producto no encontrado con ID:", productId);
            return res.status(404).json({ status: "error", message: "Producto no encontrado" }); // Usar 404 Not Found
        }

        // Agregar el producto al array en memoria
        // TODO: REFACTOR POTENCIAL: Esta aproximación (modificar array y luego guardar todo)
        // puede ser ineficiente para carritos grandes y propensa a condiciones de carrera si hay
        // múltiples requests simultáneos. Una mejor solución sería tener un método en
        // cartService/DAO como `addItemToCart(cartId, productId, quantity)` que encapsule
        // la lógica de buscar el item, actualizar cantidad o añadirlo, directamente en la BD.
        cart.products.push({ product: product._id, quantity: Number(quantity) });

        // Guardar el carrito completo actualizado en la base de datos
        const updatedCart = await cartService.updateCart(cart._id, cart.products);
        if (!updatedCart) {
             console.error(`❌ Error en addProductSessionCart: No se pudo actualizar el carrito ${cart._id} en la BD`);
             return res.status(500).json({ status: "error", message: "Error interno al actualizar el carrito" });
        }

        console.log(`✅ Producto ${productId} (x${quantity}) agregado al carrito ${cart._id} y guardado.`);

        // Respuesta exitosa (podrías devolver el carrito actualizado)
        res.json({ status: "success", message: "Producto agregado al carrito de sesión", cartId: cart._id });

    } catch (error) {
        console.error("❌ Error en addProductSessionCart:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
}; // Cerrar addProductSessionCart

export const getCartById = async (req, res) => {
    try {
        const cart = await cartService.getCartById(req.params.cid);

        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        res.json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        const cart = await cartService.addProductToCart(cid, pid, quantity);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        res.json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ status: "error", message: "Formato inválido de productos" });
        }

        const updatedCart = await cartService.updateCart(cid, products);

        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        let { quantity } = req.body;

        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ status: "error", message: "Cantidad no válida" });
        }

        const cart = await cartService.updateProductQuantity(cid, pid, quantity);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartService.deleteProductFromCart(cid, pid);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        res.json({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};


export const deleteCart = async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await cartService.deleteCart(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", message: "Carrito vaciado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
export const checkoutCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartService.getCartById(cid);

        if (!cart || cart.products.length === 0) {
            console.log("⚠ Carrito vacío. Enviando estructura vacía.");
            return res.render("checkout", { title: "Compra Finalizada", products: [], totalPrice: 0 });
        }

        // Extraer los productos para la orden
        const purchasedProducts = cart.products.map(item => ({
            product: item.product._id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
            thumbnails: item.product.thumbnails?.[0] || 'https://via.placeholder.com/150'
        }));

        const totalPrice = purchasedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        console.log("📌 Enviando a Handlebars:", { products: purchasedProducts, totalPrice });

        // Guardar la orden en la base de datos
        const newOrder = await orderService.createOrder({
            cartId: cart._id,
            products: purchasedProducts,
            totalPrice
        });
        console.log("📝 Orden guardada correctamente:", newOrder._id); // Log ID de la orden

        // Vaciar el carrito en la base de datos después de crear la orden
        try {
            await cartService.updateCart(cid, []); // Actualizar con array vacío de productos
            console.log(`🛒 Carrito ${cid} vaciado después de la compra.`);
        } catch (updateError) {
            // Loggear el error pero continuar, la orden ya se creó
            console.error(`⚠️ Error al intentar vaciar el carrito ${cid} después de la compra:`, updateError);
        }

        // Limpiar el ID del carrito de la sesión
        req.session.cartId = null;
        console.log("🔑 ID de carrito eliminado de la sesión.");

        // Renderizar la vista de checkout con los datos de la compra
        res.render("checkout", {
            title: "Compra Finalizada",
            products: purchasedProducts,
            totalPrice
        });
    } catch (error) {
        console.error("❌ Error en checkoutCart:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getAllCarts = async (req, res) => {
    try {
        const carts = await cartService.getAllCarts();
        res.json({ status: "success", carts });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
