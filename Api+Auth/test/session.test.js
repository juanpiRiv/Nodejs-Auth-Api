import { expect } from 'chai';
import request from 'supertest';
import server from '../src/server.js';

describe('Sessions', () => {
    // Usar un email único para cada ejecución de test
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    let testAgent;

    before(() => {
        // Crear un agente para mantener cookies entre requests
        testAgent = request.agent(server);
    });

    it('POST /api/sessions/register - debería registrar usuario', async () => {
        const user = {
            first_name: "Test",
            last_name: "User",
            email: uniqueEmail, // Usar email único
            age: 30,
            password: "123",
            role: "user"
        };

        const res = await testAgent
            .post('/api/sessions/register')
            .send(user);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('status', 'success');
    });

    it('POST /api/sessions/login - debería loguear usuario', async () => {
        const res = await testAgent
            .post('/api/sessions/login')
            .send({ email: uniqueEmail, password: "123" });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'success');
    });

    it('GET /api/sessions/current - debería obtener el usuario actual', async () => {
        // Usar el mismo agente que ya tiene la sesión del login anterior
        const res = await testAgent
            .get('/api/sessions/current');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'success');
        expect(res.body).to.have.property('payload').and.be.an('object');
        expect(res.body.payload).to.have.property('email', uniqueEmail);
    });

    it('GET /api/sessions/logout - debería cerrar la sesión del usuario', async () => {
        // El agente ya tiene la sesión activa del test anterior
        const res = await testAgent
            .get('/api/sessions/logout');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Logout successful');

        // Verificar que el usuario ya no está autenticado
        const currentRes = await testAgent
            .get('/api/sessions/current');

        expect(currentRes.status).to.equal(401);
    });

    // Test alternativo si tu API usa tokens en lugar de cookies
    it('Token-based auth test (si aplica)', async () => {
        // Primero registrar otro usuario para este test
        const anotherUser = {
            first_name: "Token",
            last_name: "User",
            email: `tokenuser${Date.now()}@example.com`,
            age: 25,
            password: "456",
            role: "user"
        };

        await request(server)
            .post('/api/sessions/register')
            .send(anotherUser);

        // Login para obtener token
        const loginRes = await request(server)
            .post('/api/sessions/login')
            .send({ email: anotherUser.email, password: "456" });

        expect(loginRes.status).to.equal(200);

        // Si el login devuelve un token en el body
        if (loginRes.body.token) {
            const token = loginRes.body.token;

            // Test current con token
            const currentRes = await request(server)
                .get('/api/sessions/current')
                .set('Authorization', `Bearer ${token}`);

            expect(currentRes.status).to.equal(200);
            expect(currentRes.body.payload).to.have.property('email', anotherUser.email);

            // Test logout con token
            const logoutRes = await request(server)
                .get('/api/sessions/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(logoutRes.status).to.equal(200);
        } else {
            // Si no hay token, skip este test
            console.log('API no devuelve token - usando solo cookies');
        }
    });
});

// Tests de limpieza (opcional)
describe('Sessions - Cleanup Tests', () => {
    it('POST /api/sessions/register - debería manejar email duplicado', async () => {
        const user = {
            first_name: "Duplicate",
            last_name: "User",
            email: "duplicate@example.com",
            age: 30,
            password: "123",
            role: "user"
        };

        // Primer registro
        const firstRes = await request(server)
            .post('/api/sessions/register')
            .send(user);

        // Segundo registro con mismo email
        const secondRes = await request(server)
            .post('/api/sessions/register')
            .send(user);

        expect(secondRes.status).to.equal(400);
        expect(secondRes.body).to.have.property('status', 'error');
    });

    it('POST /api/sessions/login - debería manejar credenciales incorrectas', async () => {
        const res = await request(server)
            .post('/api/sessions/login')
            .send({ email: "nonexistent@example.com", password: "wrong" });

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('status', 'error');
    });

    it('GET /api/sessions/current - debería devolver 401 sin autenticación', async () => {
        const res = await request(server)
            .get('/api/sessions/current');

        expect(res.status).to.equal(401);
    });
});