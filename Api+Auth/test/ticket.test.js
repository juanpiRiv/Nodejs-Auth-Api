import { expect } from 'chai';
import request from 'supertest';
import server from '../src/server.js';

describe('Tickets API', () => {
    let adminAgent;
    let userAgent;
    let testTicketId; // Para almacenar el ID del ticket creado
    let testCartId; // Para crear un ticket
    let testProductId; // Para agregar al carrito antes de comprar

    // Datos de usuarios para testing (copia de product.test.js)
    const adminUser = {
        first_name: "Admin",
        last_name: "Test",
        email: `admin_ticket_${Date.now()}@example.com`,
        age: 30,
        password: "123",
        role: "admin"
    };

    const regularUser = {
        first_name: "User",
        last_name: "Test",
        email: `user_ticket_${Date.now()}@example.com`,
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

            console.log('Admin login status (Tickets test):', adminLoginRes.status);

            // Registrar y loguear usuario regular
            await userAgent
                .post('/api/sessions/register')
                .send(regularUser);

            const userLoginRes = await userAgent
                .post('/api/sessions/login')
                .send({ email: regularUser.email, password: regularUser.password });

            console.log('User login status (Tickets test):', userLoginRes.status);

        } catch (error) {
            console.error('Error en setup (Tickets test):', error.message);
        }
    });

    // Hook para crear un ticket de prueba antes de los tests de ticket
    before(async () => {
        try {
            // 1. Crear un producto
            const uniqueCode = `ticket_prod_${Date.now()}`;
            const productRes = await adminAgent
                .post('/api/products')
                .send({
                    title: "Ticket Test Product",
                    stock: 10,
                    price: 100,
                    description: "Producto para test de ticket",
                    category: "Test",
                    code: uniqueCode,
                    thumbnail: "ticket-test-image.jpg",
                    status: true
                });

            if (productRes.status === 201) {
                testProductId = productRes.body.product._id || productRes.body.product.id;
                console.log('Test product created for ticket test with ID:', testProductId);
            } else {
                console.error('Failed to create test product for ticket test:', productRes.status, productRes.body);
                return; // Detener si falla la creación del producto
            }

            // 2. Crear un carrito
            const cartRes = await userAgent
                .post('/api/carts');

            // Agregar producto al carrito inmediatamente después de crearlo
            if (cartRes.status === 201) {
                testCartId = cartRes.body.payload._id;
                console.log('Test cart created for ticket test with ID:', testCartId);

                const addProductRes = await userAgent
                    .post(`/api/carts/${testCartId}/products/${testProductId}`)
                    .send({ quantity: 1 });

                if (addProductRes.status !== 200) {
                    console.error('Failed to add product to cart for ticket test:', addProductRes.status, addProductRes.body);
                    return; // Detener si falla agregar producto
                }
                console.log('Product added to cart for ticket test');
            } else {
                console.error('Failed to create test cart for ticket test:', cartRes.status, cartRes.body);
                return; // Detener si falla la creación del carrito
            }

            if (addProductRes.status !== 200) {
                console.error('Failed to add product to cart for ticket test:', addProductRes.status, addProductRes.body);
                return; // Detener si falla agregar producto
            }
            console.log('Product added to cart for ticket test');


            // 4. Completar la compra del carrito para generar un ticket
            const purchaseRes = await userAgent
                .post(`/api/carts/${testCartId}/purchase`);

            if (purchaseRes.status === 200) {
                testTicketId = purchaseRes.body.payload?.ticket?._id || purchaseRes.body.payload?.ticket?.id;
                console.log('Test ticket created with ID:', testTicketId);
            } else {
                console.error('Failed to create test ticket:', purchaseRes.status, purchaseRes.body);
                throw new Error('Failed to create test ticket'); // Lanzar error para que la prueba falle
            }
        } catch (error) {
            console.error('Error creating test ticket:', error.message);
            throw error; // Lanzar error para que la prueba falle
        }
    });

    describe('GET /api/tickets', () => {
        it('debería obtener todos los tickets con sesión de usuario regular', async () => {
            const res = await userAgent
                .get('/api/tickets');

            console.log('Get all tickets response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array');
            // Opcional: verificar que el ticket creado esté en la lista
            if (testTicketId) {
                const foundTicket = res.body.payload.find(ticket => ticket._id === testTicketId);
                expect(foundTicket).to.exist;
            }
        });

        it('debería fallar al obtener todos los tickets sin autenticación', async () => {
            const res = await request(server)
                .get('/api/tickets');

            expect(res.status).to.equal(401);
        });
    });

    describe('GET /api/tickets/:tid', () => {
        it('debería obtener un ticket por ID con sesión de usuario regular', async () => {
            if (!testTicketId) {
                console.log('No testTicketId available, skipping GET /api/tickets/:tid test');
                return;
            }
            const res = await userAgent
                .get(`/api/tickets/${testTicketId}`);

            console.log('Get ticket by ID response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.have.property('_id', testTicketId);
            expect(res.body.payload).to.have.property('purchaser', regularUser.email);
        });

        it('debería fallar al obtener un ticket por ID sin autenticación', async () => {
            if (!testTicketId) {
                console.log('No testTicketId available, skipping GET /api/tickets/:tid without auth test');
                return;
            }
            const res = await request(server)
                .get(`/api/tickets/${testTicketId}`);

            expect(res.status).to.equal(401);
        });

        it('debería devolver 404 para ticket inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6789abcdef0'; // ObjectId válido pero inexistente
            const res = userAgent
                .get(`/api/tickets/${fakeId}`);

            console.log('Get nonexistent ticket response:', res.status, res.body);
            expect(res.status).to.equal(404);
        });
    });


    // Cleanup después de los tests
    after(async () => {
        try {
            // Eliminar el producto de prueba creado
            if (testProductId) {
                const deleteProductRes = await adminAgent.delete(`/api/products/${testProductId}`);
                console.log('Test product deletion status:', deleteProductRes.status);
            }

            // Logout de ambas sesiones
            await adminAgent.get('/api/sessions/logout');
            await userAgent.get('/api/sessions/logout');
            console.log('Sessions logged out successfully (Tickets test)');
        } catch (error) {
            console.log('Error during cleanup (Tickets test):', error.message);
        }
    });
});
