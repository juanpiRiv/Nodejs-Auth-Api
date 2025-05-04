import productDAO from '../dao/product.dao.js';

class ProductService {
    async getProducts(filter, options) {
        return await productDAO.getProducts(filter, options);
    }

    async getProductById(id) {
        return await productDAO.getProductById(id);
    }

    async addProduct(productData) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productDAO.addProduct(productData);
    }

    async updateProduct(id, productData) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productDAO.updateProduct(id, productData);
    }

    async deleteProduct(id) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productDAO.deleteProduct(id);
    }
}

export default new ProductService();
