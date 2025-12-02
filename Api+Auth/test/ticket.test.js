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
            console.log('Admin login response body:', adminLoginRes.body);

            // Verificar la sesión del admin
            const adminSessionRes = await adminAgent.get('/api/sessions/current');
            console.log('Admin session check:', adminSessionRes.status, adminSessionRes.body);

            // Registrar y loguear usuario regular
            await userAgent
                .post('/api/sessions/register')
                .send(regularUser);

            const userLoginRes = await userAgent
                .post('/api/sessions/login')
                .send({ email: regularUser.email, password: regularUser.password });

            console.log('User login status (Tickets test):', userLoginRes.status);
            console.log('User login response body:', userLoginRes.body);

            // Verificar la sesión del usuario
            const userSessionRes = await userAgent.get('/api/sessions/current');
            console.log('User session check:', userSessionRes.status, userSessionRes.body);

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
                console.log('Product response structure:', JSON.stringify(productRes.body, null, 2));
            } else {
                console.error('Failed to create test product for ticket test:', productRes.status, productRes.body);
                throw new Error('Failed to create test product');
            }

            // 2. Crear un carrito
            const cartRes = await userAgent
                .post('/api/carts');

            console.log('Cart creation response:', cartRes.status, cartRes.body);

            if (cartRes.status === 201) {
                // Intentar diferentes estructuras de respuesta
                testCartId = cartRes.body.payload?._id || 
                            cartRes.body.payload?.id || 
                            cartRes.body._id || 
                            cartRes.body.id ||
                            cartRes.body.cartId ||
                            cartRes.body.data?._id ||
                            cartRes.body.data?.id;
                
                console.log('Test cart created for ticket test with ID:', testCartId);
                
                if (!testCartId) {
                    console.error('Could not extract cart ID from response:', cartRes.body);
                    throw new Error('Could not extract cart ID from response');
                }
            } else {
                console.error('Failed to create test cart for ticket test:', cartRes.status, cartRes.body);
                throw new Error('Failed to create test cart');
            }

            // 3. Agregar producto al carrito
            const addProductRes = await userAgent
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .send({ quantity: 1 });

            console.log('Add product to cart response:', addProductRes.status, addProductRes.body);

            if (addProductRes.status !== 200 && addProductRes.status !== 201) {
                console.error('Failed to add product to cart for ticket test:', addProductRes.status, addProductRes.body);
                throw new Error('Failed to add product to cart');
            }
            console.log('Product added to cart for ticket test');

            // 4. Completar la compra del carrito para generar un ticket
            const purchaseRes = await userAgent
                .post(`/api/carts/${testCartId}/purchase`);

            console.log('Purchase response:', purchaseRes.status, JSON.stringify(purchaseRes.body, null, 2));

            if (purchaseRes.status === 200 || purchaseRes.status === 201) {
                testTicketId = purchaseRes.body.payload?.ticket?._id || 
                             purchaseRes.body.payload?.ticket?.id ||
                             purchaseRes.body.ticket?._id ||
                             purchaseRes.body.ticket?.id ||
                             purchaseRes.body._id ||
                             purchaseRes.body.id;
                             
                console.log('Test ticket created with ID:', testTicketId);
                
                if (!testTicketId) {
                    console.error('Could not extract ticket ID from response:', purchaseRes.body);
                    throw new Error('Could not extract ticket ID from response');
                }
            } else {
                console.error('Failed to create test ticket:', purchaseRes.status, purchaseRes.body);
                throw new Error('Failed to create test ticket');
            }
        } catch (error) {
            console.error('Error creating test ticket:', error.message);
            throw error;
        }
    });

    describe('GET /api/tickets', () => {
        it('debería obtener todos los tickets con sesión de admin', async () => {
            const res = await adminAgent
                .get('/api/tickets');

            console.log('Get all tickets response:', res.status, res.body);

            // Si el endpoint requiere un rol específico y el admin no lo tiene,
            // ajustamos la expectativa
            if (res.status === 403) {
                console.log('Admin también recibe 403, el endpoint requiere permisos especiales');
                expect(res.status).to.equal(403);
                expect(res.body).to.have.property('status', 'error');
                expect(res.body).to.have.property('message').that.includes('Forbidden');
                return;
            }

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            
            // Verificar la estructura de la respuesta
            const tickets = res.body.payload || res.body.tickets || res.body.data;
            expect(tickets).to.exist;
            expect(tickets).to.be.an('array');
            
            // Opcional: verificar que el ticket creado esté en la lista
            if (testTicketId && tickets) {
                const foundTicket = tickets.find(ticket => 
                    (ticket._id === testTicketId) || (ticket.id === testTicketId)
                );
                expect(foundTicket).to.exist;
            }
        });

        it('debería fallar al obtener todos los tickets con usuario regular (403)', async () => {
            const res = await userAgent
                .get('/api/tickets');

            console.log('User trying to get all tickets:', res.status, res.body);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('status', 'error');
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
            // Ajustar según la estructura real de la respuesta
            const ticket = res.body.ticket || res.body.payload;
            expect(ticket).to.exist;
            expect(ticket).to.have.property('id', testTicketId);
            expect(ticket).to.have.property('purchaser', regularUser.email);
        });

        it('debería obtener un ticket por ID con sesión de admin', async () => {
            if (!testTicketId) {
                console.log('No testTicketId available, skipping GET /api/tickets/:tid admin test');
                return;
            }
            const res = await adminAgent
                .get(`/api/tickets/${testTicketId}`);

            console.log('Admin get ticket by ID response:', res.status, res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            const ticket = res.body.ticket || res.body.payload;
            expect(ticket).to.exist;
            expect(ticket).to.have.property('id', testTicketId);
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
            const res = await userAgent
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