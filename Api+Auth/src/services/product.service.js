import productRepository from '../repositories/product.repository.js';
import mongoose from 'mongoose';
// import { ApiError } from '../utils/api.utils.js';

class ProductService {
    async getProducts(filter, options) {
        return await productRepository.model.paginate(filter, options);
    }

    async getProductById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError('ID inválido', 400);
        }
        const product = await productRepository.findById(id);
        if (!product) {
            throw new ApiError('Producto no encontrado', 404);
        }
        return product;
    }

    async addProduct(productData) {
        if (typeof productData.price !== 'number' || productData.price <= 0) {
            throw new ApiError('El precio debe ser un número positivo', 400);
        }
        if (typeof productData.stock !== 'number' || productData.stock < 0) {
            throw new ApiError('El stock debe ser un número positivo', 400);
        }
        const existingProduct = await productRepository.model.findOne({ code: productData.code });
        if (existingProduct) {
            throw new ApiError('El código del producto ya existe', 400);
        }
        return await productRepository.create(productData);
    }

    async updateProduct(id, productData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError('ID inválido', 400);
        }
        const product = await productRepository.findById(id);
        if (!product) {
            throw new ApiError('Producto no encontrado', 404);
        }
        if (productData.code) {
            const existingProduct = await productRepository.model.findOne({ code: productData.code });
            if (existingProduct && existingProduct._id.toString() !== id) {
                throw new ApiError('El código del producto ya existe', 400);
            }
        }
         if (productData.price && (typeof productData.price !== 'number' || productData.price <= 0)) {
            throw new ApiError('El precio debe ser un número positivo', 400);
        }
        if (productData.stock && (typeof productData.stock !== 'number' || productData.stock < 0)) {
            throw new ApiError('El stock debe ser un número positivo', 400);
        }
        return await productRepository.update(id, productData);
    }

    async deleteProduct(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError('ID inválido', 400);
        }
        const product = await productRepository.findById(id);
        if (!product) {
            throw new ApiError('Producto no encontrado', 404);
        }
        return await productRepository.delete(id);
    }

    async updateProductStock(id, quantityChange) {
        const product = await productRepository.findById(id);
         if (!product) {
            throw new ApiError('Producto no encontrado', 404);
        }
        product.stock += quantityChange;
        return await productRepository.update(id, { stock: product.stock });
    }
}

export default new ProductService();
