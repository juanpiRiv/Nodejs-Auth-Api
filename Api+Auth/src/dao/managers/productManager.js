import Product from '../models/Product.model.js';

class ProductDAO {
    async getProducts(filter = {}, options = {}) {
        return await Product.paginate(filter, options);
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async addProduct(productData) {
        return await Product.create(productData);
    }

    async updateProduct(id, productData) {
        return await Product.findByIdAndUpdate(id, productData, { new: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async updateStock(id, quantityChange) {
        // Utiliza $inc para incrementar/decrementar el stock.
        // quantityChange será negativo para descontar stock.
        return await Product.findByIdAndUpdate(id, { $inc: { stock: quantityChange } }, { new: true });
    }
}

export default new ProductDAO();
