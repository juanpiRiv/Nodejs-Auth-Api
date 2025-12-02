import cartRepository from '../repositories/cart.repository.js';
import productRepository from '../repositories/product.repository.js';

class CartService {
    async createCart(cartData) {
        return await cartRepository.create(cartData);
    }

    async getCartById(id) {
        return await cartRepository.findById(id);
    }

async addProductToCart(cid, pid, quantity) {
        const product = await productRepository.findById(pid);
        if (!product) {
            throw new Error('Product not found');
        }
        return await cartRepository.model.findByIdAndUpdate(
            cid,
            { $push: { products: { product: pid, quantity } } },
            { new: true }
        );
}

    async updateCart(cid, products) {
        return await cartRepository.model.findByIdAndUpdate(cid, { products }, { new: true });
    }

    async updateProductQuantity(cid, pid, quantity) {
        return await cartRepository.model.findOneAndUpdate(
            { _id: cid, "products.product": pid },
            { $set: { "products.$.quantity": quantity } },
            { new: true }
        );
    }

    async deleteProductFromCart(cid, pid) {
        return await cartRepository.model.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        );
    }

    async deleteCart(cid) {
        return await cartRepository.delete(cid);
    }

    async getAllCarts() {
        return await cartRepository.model.find();
    }
}

export default new CartService();
