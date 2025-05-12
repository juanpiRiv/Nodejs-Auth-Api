import Cart from '../models/Cart.model.js'; // Corregida la ruta del modelo de carrito (ruta relativa correcta)

class CartDAO {
    async createCart(cartData) {
        return await Cart.create(cartData);
    }

    async getCartById(id) {
        return await Cart.findById(id).populate('products.product');
    }

    async addProductToCart(cid, pid, quantity) {
        const cart = await Cart.findById(cid);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        await cart.save();
        return cart;
    }

    async updateCart(cid, products) {
        return await Cart.findByIdAndUpdate(cid, { products }, { new: true }).populate('products.product');
    }

    async updateProductQuantity(cid, pid, quantity) {
        const cart = await Cart.findById(cid);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            return cart;
        }
        return null;
    }

    async deleteProductFromCart(cid, pid) {
        const cart = await Cart.findById(cid);
        if (!cart) return null;

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        return cart;
    }

    async deleteCart(cid) {
        return await Cart.findById(cid);
        if (!cart) return null;

        cart.products = [];
        await cart.save();
        return cart;
    }

    async getAllCarts() {
        return await Cart.find().populate('products.product').lean();
    }
}

export default new CartDAO();
