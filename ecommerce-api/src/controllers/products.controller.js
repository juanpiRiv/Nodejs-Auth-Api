import productService from '../services/product.service.js'; // Importar el servicio

export const getProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10, sort, search, category } = req.query;
        page = parseInt(page) > 0 ? parseInt(page) : 1;
        limit = parseInt(limit) > 0 ? parseInt(limit) : 10;

        let filter = {};

        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        if (category) {
            filter.category = { $regex: category, $options: "i" };
        }

        const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

        const options = { page, limit, sort: sortOption, lean: true };

        const result = await productService.getProducts(filter, options); // Usar el servicio

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort}&search=${search}&category=${category}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort}&search=${search}&category=${category}` : null,
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.pid); // Usar el servicio
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const product = await productService.addProduct(req.body); // Usar el servicio
        res.status(201).json({ status: "success", product });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.pid, req.body); // Usar el servicio
        if (!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.pid); // Usar el servicio
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
