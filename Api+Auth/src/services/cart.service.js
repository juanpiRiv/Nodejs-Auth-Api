import cartRepository from '../repositories/cart.repository.js';

class CartService {
    async createCart(cartData) {
        return await cartRepository.create(cartData);
    }

    async getCartById(id) {
        return await cartRepository.findById(id);
    }

    async addProductToCart(cid, pid, quantity) {
        const cart = await cartRepository.findById(cid);
        cart.products.push({ product: pid, quantity });
        return await cartRepository.update(cid, cart);
    }

    async updateCart(cid, products) {
        return await cartRepository.update(cid, products);
    }

    async updateProductQuantity(cid, pid, quantity) {
        const cart = await cartRepository.findById(cid);
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        cart.products[productIndex].quantity = quantity;
        return await cartRepository.update(cid, cart);
    }

    async deleteProductFromCart(cid, pid) {
        const cart = await cartRepository.findById(cid);
        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        return await cartRepository.update(cid, cart);
    }

    async deleteCart(cid) {
        return await cartRepository.delete(cid);
    }

    async getAllCarts() {
        return await cartRepository.model.find();
    }
}

export default new CartService();
