import { expect } from 'chai';
import request from 'supertest';
import server from '../src/server.js';

describe('Carts API', () => {
    let adminAgent;
    let userAgent;
    let testCartId; // Para almacenar el ID del carrito creado
    let testProductId; // Para almacenar el ID de un producto de prueba

    // Datos de usuarios para testing
    const adminUser = {
        first_name: "Admin",
        last_name: "Test",
        email: `admin${Date.now()}@example.com`,
        age: 30,
        password: "123",
        role: "admin"
    };

    const regularUser = {
        first_name: "User",
        last_name: "Test",
        email: `user${Date.now()}@example.com`,
        age: 25,
        password: "123",
        role: "user"
    };

    // Setup: Crear usuarios y establecer sesiones con cookies
    before(async () => {
        // Crear agentes que mantienen cookies automáticamente
        adminAgent = request.agent(server);
        userAgent = request.agent(server);

        try {
            // Registrar y loguear usuario admin
            await adminAgent
                .post('/api/sessions/register')
                .send(adminUser);

            const adminLoginRes = await adminAgent
                .post('/api/sessions/login')
                .send({ email: adminUser.email, password: adminUser.password });

            console.log('Admin login status:', adminLoginRes.status);
            expect(adminLoginRes.status).to.be.oneOf([200, 302]); // Verificar login exitoso

            // Registrar y loguear usuario regular
            await userAgent
                .post('/api/sessions/register')
                .send(regularUser);

            const userLoginRes = await userAgent
                .post('/api/sessions/login')
                .send({ email: regularUser.email, password: regularUser.password });

            console.log('User login status:', userLoginRes.status);
            expect(userLoginRes.status).to.be.oneOf([200, 302]); // Verificar login exitoso

        } catch (error) {
            console.error('Error en setup:', error.message);
            throw error; // Re-lanzar el error para que falle el test si el setup no funciona
        }
    });

    // Hook para crear un producto de prueba antes de los tests de carrito
    before(async () => {
        try {
            const uniqueCode = `cart_prod_${Date.now()}`;
            const testProduct = {
                title: "Cart Test Product",
                stock: 50,
                price: 500,
                description: "Producto para test de carrito",
                category: "Test",
                code: uniqueCode,
                thumbnail: "cart-test-image.jpg",
                status: true
            };

            const res = await adminAgent
                .post('/api/products')
                .send(testProduct);

            console.log('Create product response:', res.status, res.body);

            if (res.status === 201) {
                // Capturar el ID del producto de manera más robusta
                testProductId = res.body.product?._id || 
                               res.body.product?.id || 
                               res.body.payload?._id || 
                               res.body.payload?.id ||
                               res.body._id ||
                               res.body.id;
                
                console.log('Test product created with ID:', testProductId);
                expect(testProductId).to.exist;
            } else {
                console.error('Failed to create test product:', res.status, res.body);
                throw new Error(`Failed to create test product: ${res.status}`);
            }
        } catch (error) {
            console.error('Error creating test product:', error.message);
            throw error;
        }
    });

    describe('POST /api/carts', () => {
        it('debería crear un carrito con sesión de usuario regular', async () => {
            const res = await userAgent
                .post('/api/carts');

            console.log('Create cart response:', res.status, res.body);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('status', 'success');
            
            // Capturar el ID del carrito de manera más robusta
            testCartId = res.body.payload?._id || 
                        res.body.payload?.id || 
                        res.body.cart?._id || 
                        res.body.cart?.id ||
                        res.body._id ||
                        res.body.id ||
                        res.body.cartId;
            
            console.log('Captured cartId:', testCartId);
            expect(testCartId).to.exist;
            
            console.log('Test cart created with ID:', testCartId);
        });

        it('debería fallar al crear un carrito sin autenticación', async () => {
            const res = await request(server)
                .post('/api/carts');

            expect(res.status).to.be.oneOf([401, 403]); // Permitir ambos códigos de error de autenticación
        });
    });

    describe('GET /api/carts/:cid', () => {
        it('debería mostrar un carrito guardado con sesión de usuario regular', async () => {
            if (!testCartId) {
                throw new Error('No testCartId available - el test de creación de carrito debe ejecutarse primero');
            }
            
            const res = await userAgent
                .get(`/api/carts/${testCartId}`);

            console.log('Get cart response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            // Flexibilidad en la estructura de respuesta
            const cart = res.body.payload || res.body.cart;
            expect(cart).to.exist;
            
            const cartId = cart._id || cart.id;
            expect(cartId.toString()).to.equal(testCartId.toString());
            expect(cart.products).to.be.an('array');
        });

        it('debería fallar al mostrar un carrito sin autenticación', async () => {
            if (!testCartId) {
                console.log('No testCartId available, skipping test');
                this.skip();
                return;
            }
            
            const res = await request(server)
                .get(`/api/carts/${testCartId}`);

            expect(res.status).to.be.oneOf([401, 403]);
        });

        it('debería devolver 404 para carrito inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6789abcdef0'; // ObjectId válido pero inexistente
            const res = await userAgent
                .get(`/api/carts/${fakeId}`);

            console.log('Get nonexistent cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });

    describe('POST /api/carts/:cid/products/:pid', () => {
        it('debería agregar un producto a un carrito con sesión de usuario regular', async () => {
            if (!testCartId || !testProductId) {
                throw new Error('No testCartId or testProductId available - tests anteriores deben ejecutarse primero');
            }
            
            const res = await userAgent
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .send({ quantity: 2 });

            console.log('Add product to cart response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            const cart = res.body.payload || res.body.cart;
            expect(cart).to.exist;
            
            const cartId = cart._id || cart.id;
            expect(cartId.toString()).to.equal(testCartId.toString());
            expect(cart.products).to.be.an('array').that.is.not.empty;
            
            // Buscar el producto agregado de manera más flexible
            const addedProduct = cart.products.find(p => {
                const productId = p.product?._id || p.product?.id || p.product;
                return productId.toString() === testProductId.toString();
            });
            expect(addedProduct).to.exist;
            expect(addedProduct.quantity).to.equal(2);
        });

        it('debería fallar al agregar un producto sin autenticación', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const res = await request(server)
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .send({ quantity: 1 });

            expect(res.status).to.be.oneOf([401, 403]);
        });

        it('debería fallar al agregar un producto a un carrito inexistente', async () => {
            if (!testProductId) {
                console.log('No testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const fakeCartId = '64a1b2c3d4e5f6789abcdef0';
            const res = await userAgent
                .post(`/api/carts/${fakeCartId}/products/${testProductId}`)
                .send({ quantity: 1 });

            console.log('Add product to nonexistent cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });

        it('debería fallar al agregar un producto inexistente a un carrito', async () => {
            if (!testCartId) {
                console.log('No testCartId available, skipping test');
                this.skip();
                return;
            }
            
            const fakeProductId = '64a1b2c3d4e5f6789abcdef0';
            const res = await userAgent
                .post(`/api/carts/${testCartId}/products/${fakeProductId}`)
                .send({ quantity: 1 });

            console.log('Add nonexistent product to cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });

    describe('PUT /api/carts/:cid', () => {
        it('debería modificar un carrito con sesión de usuario regular', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const updateData = {
                products: [
                    { product: testProductId, quantity: 5 }
                ]
            };
            
            const res = await userAgent
                .put(`/api/carts/${testCartId}`)
                .send(updateData);

            console.log('Update cart response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            const cart = res.body.payload || res.body.cart;
            expect(cart).to.exist;
            
            const cartId = cart._id || cart.id;
            expect(cartId.toString()).to.equal(testCartId.toString());
            expect(cart.products).to.be.an('array').with.lengthOf(1);
            expect(cart.products[0].quantity).to.equal(5);
        });

        it('debería fallar al modificar un carrito sin autenticación', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const updateData = { products: [{ product: testProductId, quantity: 1 }] };
            const res = await request(server)
                .put(`/api/carts/${testCartId}`)
                .send(updateData);

            expect(res.status).to.be.oneOf([401, 403]);
        });

        it('debería fallar al modificar un carrito inexistente', async () => {
            if (!testProductId) {
                console.log('No testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const fakeCartId = '64a1b2c3d4e5f6789abcdef0';
            const updateData = { products: [{ product: testProductId, quantity: 1 }] };
            const res = await userAgent
                .put(`/api/carts/${fakeCartId}`)
                .send(updateData);

            console.log('Update nonexistent cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });

    describe('DELETE /api/carts/:cid/product/:pid', () => {
        it('debería eliminar un producto de un carrito con sesión de usuario regular', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            // Primero, asegúrate de que el producto esté en el carrito
            await userAgent
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .send({ quantity: 1 });

            const res = await userAgent
                .delete(`/api/carts/${testCartId}/product/${testProductId}`);

            console.log('Delete product from cart response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            const cart = res.body.payload || res.body.cart;
            expect(cart).to.exist;
            
            const cartId = cart._id || cart.id;
            expect(cartId.toString()).to.equal(testCartId.toString());
            
            // Verificar que el producto ya no esté en el carrito
            const deletedProduct = cart.products.find(p => {
                const productId = p.product?._id || p.product?.id || p.product;
                return productId.toString() === testProductId.toString();
            });
            expect(deletedProduct).to.be.undefined;
        });

        it('debería fallar al eliminar un producto sin autenticación', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const res = await request(server)
                .delete(`/api/carts/${testCartId}/product/${testProductId}`);

            expect(res.status).to.be.oneOf([401, 403]);
        });

        it('debería fallar al eliminar un producto de un carrito inexistente', async () => {
            if (!testProductId) {
                console.log('No testProductId available, skipping test');
                this.skip();
                return;
            }
            
            const fakeCartId = '64a1b2c3d4e5f6789abcdef0';
            const res = await userAgent
                .delete(`/api/carts/${fakeCartId}/product/${testProductId}`);

            console.log('Delete product from nonexistent cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });

        it('debería fallar al eliminar un producto inexistente de un carrito', async () => {
            if (!testCartId) {
                console.log('No testCartId available, skipping test');
                this.skip();
                return;
            }
            
            const fakeProductId = '64a1b2c3d4e5f6789abcdef0';
            const res = await userAgent
                .delete(`/api/carts/${testCartId}/product/${fakeProductId}`);

            console.log('Delete nonexistent product from cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });

    describe('POST /api/carts/:cid/purchase', () => {
        it('debería completar la compra de un carrito con sesión de usuario regular', async () => {
            if (!testCartId || !testProductId) {
                console.log('No testCartId or testProductId available, skipping test');
                this.skip();
                return;
            }
            
            // Asegúrate de que el carrito tenga al menos un producto para comprar
            await userAgent
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .send({ quantity: 1 });

            const res = await userAgent
                .post(`/api/carts/${testCartId}/purchase`);

            console.log('Purchase cart response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            const payload = res.body.payload;
            expect(payload).to.have.property('ticket');
            expect(payload.ticket).to.have.property('_id');
            expect(payload.ticket.purchaser).to.equal(regularUser.email);
        });

        it('debería fallar al completar la compra sin autenticación', async () => {
            if (!testCartId) {
                console.log('No testCartId available, skipping test');
                this.skip();
                return;
            }
            
            const res = await request(server)
                .post(`/api/carts/${testCartId}/purchase`);

            expect(res.status).to.be.oneOf([401, 403]);
        });

        it('debería fallar al completar la compra de un carrito inexistente', async () => {
            const fakeCartId = '64a1b2c3d4e5f6789abcdef0';
            const res = await userAgent
                .post(`/api/carts/${fakeCartId}/purchase`);

            console.log('Purchase nonexistent cart response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });

    // Cleanup después de los tests
    after(async () => {
        try {
            // Logout de ambas sesiones
            await adminAgent.get('/api/sessions/logout');
            await userAgent.get('/api/sessions/logout');
            console.log('Sessions logged out successfully');
        } catch (error) {
            console.log('Error during cleanup:', error.message);
        }
    });
});