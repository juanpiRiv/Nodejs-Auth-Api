import cartManager from '../dao/managers/cartManager.js'; // Corregida la ruta y nombre del manager de carrito

class CartService {
    async createCart(cartData) {
        return await cartManager.createCart(cartData);
    }

    async getCartById(id) {
        return await cartManager.getCartById(id);
    }

    async addProductToCart(cid, pid, quantity) {
        return await cartManager.addProductToCart(cid, pid, quantity);
    }

    async updateCart(cid, products) {
        return await cartManager.updateCart(cid, products);
    }

    async updateProductQuantity(cid, pid, quantity) {
        return await cartManager.updateProductQuantity(cid, pid, quantity);
    }

    async deleteProductFromCart(cid, pid) {
        return await cartManager.deleteProductFromCart(cid, pid);
    }

    async deleteCart(cid) {
        return await cartManager.deleteCart(cid);
    }

    async getAllCarts() {
        return await cartManager.getAllCarts();
    }
}

export default new CartService();
