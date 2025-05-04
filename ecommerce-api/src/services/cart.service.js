import cartDAO from '../dao/cart.dao.js';

class CartService {
    async createCart(cartData) {
        return await cartDAO.createCart(cartData);
    }

    async getCartById(id) {
        return await cartDAO.getCartById(id);
    }

    async addProductToCart(cid, pid, quantity) {
        return await cartDAO.addProductToCart(cid, pid, quantity);
    }

    async updateCart(cid, products) {
        return await cartDAO.updateCart(cid, products);
    }

    async updateProductQuantity(cid, pid, quantity) {
        return await cartDAO.updateProductQuantity(cid, pid, quantity);
    }

    async deleteProductFromCart(cid, pid) {
        return await cartDAO.deleteProductFromCart(cid, pid);
    }

    async deleteCart(cid) {
        return await cartDAO.deleteCart(cid);
    }

    async getAllCarts() {
        return await cartDAO.getAllCarts();
    }
}

export default new CartService();
