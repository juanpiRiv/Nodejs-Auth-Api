import productManager from '../dao/managers/productManager.js'; // Corregida la ruta y nombre del manager de producto

class ProductService {
    async getProducts(filter, options) {
        return await productManager.getProducts(filter, options);
    }

    async getProductById(id) {
        return await productManager.getProductById(id);
    }

    async addProduct(productData) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productManager.addProduct(productData);
    }

    async updateProduct(id, productData) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productManager.updateProduct(id, productData);
    }

    async deleteProduct(id) {
        // Aquí iría la lógica de negocio, por ejemplo, validaciones
        return await productManager.deleteProduct(id);
    }

    // Añadida función placeholder para actualizar stock, necesaria para la compra
    async updateProductStock(id, quantityChange) {
        // Llama al método updateStock del productManager para actualizar el stock en la BDD.
        // quantityChange será negativo si se está descontando stock (ej. -1, -2).
        const updatedProduct = await productManager.updateStock(id, quantityChange);
        if (!updatedProduct) {
            // Podríamos lanzar un error más específico si es necesario.
            console.error(`Error al actualizar stock para el producto ${id}. El producto podría no existir o hubo un error en la BD.`);
            throw new Error(`No se pudo actualizar el stock para el producto ${id}.`);
        }
        console.log(`Stock actualizado para producto ${id}. Nuevo stock: ${updatedProduct.stock}`);
        return updatedProduct;
    }
}

export default new ProductService();
