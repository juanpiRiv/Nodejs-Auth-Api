# Proyecto E-commerce API

API backend robusta y profesional para una plataforma de e-commerce, desarrollada con Node.js, Express y MongoDB. Incluye autenticación, autorización por roles, gestión de carrito de compras, sistema de tickets y más.

## 📦 Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/juanpiRiv/Nodejs-Auth-Api
    cd Api+Auth
    ```


2.  **Instalar dependencias:**
    Asegúrate de tener Node.js y npm instalados. Luego, ejecuta:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del directorio `ecommerce-api` (o donde se encuentre tu `package.json`). Puedes copiar el siguiente ejemplo y modificar los valores según tu configuración:

    ```env
    # .env.example
    PORT=8080
    MONGO_URI=mongodb+srv://tu_usuario:tu_password@tu_cluster.mongodb.net/tu_base_de_datos?retryWrites=true&w=majority
    JWT_SECRET=tu_secreto_jwt_aqui
    JWT_COOKIE_NAME=authToken
    TWILIO_ACCOUNT_SID=tu_twilio_account_sid
    TWILIO_AUTH_TOKEN=tu_twilio_auth_token
    TWILIO_PHONE=tu_numero_twilio
    ADMIN_PHONE=tu_numero_admin_para_tests
    MAIL_USER=tu_email_gmail
    MAIL_PASS=tu_password_de_aplicacion_gmail
    ```
    **Importante:** Reemplaza los valores de ejemplo con tus propias credenciales y configuraciones. Para `MAIL_PASS`, si usas Gmail, necesitarás generar una "Contraseña de aplicación".

4.  **Iniciar el servidor:**
    Una vez configurado el `.env`, puedes iniciar el servidor en modo desarrollo con:
    ```bash
    npm run dev
    ```
    El servidor debería estar corriendo en `http://localhost:PORT` (el puerto especificado en tu `.env`).

## ⚙ Variables de Entorno Necesarias (`.env`)

A continuación se detallan las variables de entorno que el proyecto utiliza:

*   `PORT`: Puerto en el que correrá el servidor (ej. `8080`).
*   `MONGO_URI`: URI de conexión a tu base de datos MongoDB.
*   `JWT_SECRET`: Clave secreta para la firma de JSON Web Tokens (JWT).
*   `JWT_COOKIE_NAME`: Nombre de la cookie donde se almacenará el token JWT.
*   `TWILIO_ACCOUNT_SID`: Account SID de tu cuenta de Twilio (para envío de SMS, si aplica).
*   `TWILIO_AUTH_TOKEN`: Auth Token de tu cuenta de Twilio.
*   `TWILIO_PHONE`: Número de teléfono de Twilio desde el cual se enviarán mensajes.
*   `ADMIN_PHONE`: Número de teléfono del administrador para pruebas o notificaciones.
*   `MAIL_USER`: Dirección de correo electrónico (Gmail) para el envío de emails (ej. confirmación de compra).
*   `MAIL_PASS`: Contraseña de aplicación de Gmail para `MAIL_USER`.

## 🔐 Roles Disponibles

El sistema maneja dos roles principales para los usuarios:

*   **`user`**: Rol por defecto para los clientes que se registran. Pueden navegar por los productos, agregarlos al carrito, realizar compras y ver sus tickets.
*   **`admin`**: Rol con permisos elevados. Además de las acciones de un usuario normal, los administradores pueden gestionar productos (crear, editar, eliminar), ver todos los usuarios, y potencialmente acceder a otras funcionalidades de gestión del sistema.

La autorización se maneja mediante middlewares que verifican el rol del usuario autenticado antes de permitir el acceso a ciertas rutas o la ejecución de acciones específicas.

## 📂 Estructura de Carpetas

El proyecto sigue una estructura modular para facilitar la organización y el mantenimiento del código:

```
ecommerce-api/
├── logs/               # Archivos de logs generados por Winston
├── public/             # Archivos públicos (si aplica, ej. para vistas o assets estáticos)
├── src/
│   ├── config/         # Configuraciones (Passport, logger, variables de entorno, etc.)
│   ├── controllers/    # Lógica de negocio y manejo de solicitudes/respuestas HTTP
│   ├── dao/            # Data Access Objects (interacción directa con la base de datos)
│   │   ├── managers/   # Clases Manager que utilizan los modelos Mongoose
│   │   └── models/     # Modelos de Mongoose para las colecciones de MongoDB
│   ├── dtos/           # Data Transfer Objects (para estructurar datos entre capas)
│   ├── middlewares/    # Middlewares de Express (autenticación, autorización, errores, etc.)
│   ├── repositories/   # Patrón Repository (abstracción sobre los DAOs)
│   ├── routes/         # Definición de las rutas de la API
│   ├── services/       # Lógica de servicios (puede incluir interacción con APIs externas, etc.)
│   ├── utils/          # Funciones de utilidad (manejo de JWT, encriptación, etc.)
│   ├── validations/    # Esquemas de validación (Joi) para los datos de entrada
│   └── server.js       # Archivo principal de inicio del servidor Express
├── .env                # Archivo de variables de entorno (NO subir a Git)
├── .gitignore          # Archivos y carpetas ignorados por Git
├── package-lock.json   # Dependencias bloqueadas
├── package.json        # Metadatos del proyecto y dependencias
└── README.md           # Este archivo
```

## 🧪 Uso de la Colección Postman

Se proporciona una colección de Postman (`Auth+Api.postman_collection.json`) con todos los endpoints listos para ser probados.

**Cómo importar y usar:**

1.  Abre Postman.
2.  Haz clic en `Import` (generalmente en la esquina superior izquierda).
3.  Selecciona la pestaña `File` y luego `Upload Files`.
4.  Navega hasta el archivo `Auth+Api.postman_collection.json` en la raíz del proyecto y selecciónalo.
5.  Una vez importada, encontrarás la colección en el panel lateral de Postman.
6.  **Importante:** Algunos endpoints requieren autenticación (JWT). Generalmente, después de hacer login (`POST /api/sessions/login`), el token JWT se guarda automáticamente en una cookie (`authToken`) que Postman debería enviar en las solicitudes subsiguientes. Si no, asegúrate de configurar Postman para que envíe cookies o incluye el token manualmente en el header `Authorization` como `Bearer TU_TOKEN_AQUI` si la API está configurada para aceptarlo así también. Revisa la configuración de autenticación de cada request en Postman.

##  Principales Endpoints (Ejemplos)

Aquí algunos de los endpoints clave para interactuar con la API. Asegúrate de que el servidor esté corriendo. Por defecto, las rutas están prefijadas con `/api`.

*   **Crear un nuevo producto (Admin):**
    `POST /api/products`
    Body (JSON):
    ```json
    {
      "title": "Nuevo Producto de Prueba",
      "description": "Descripción detallada del producto.",
      "price": 199.99,
      "code": "NP001",
      "stock": 50,
      "category": "Electrónicos",
      "thumbnails": ["url_imagen1.jpg", "url_imagen2.jpg"]
    }
    ```

*   **Realizar una compra (Finalizar carrito):**
    `POST /api/carts/:cid/purchase`
    (Reemplaza `:cid` con el ID del carrito correspondiente. Requiere autenticación de usuario.)

*   **Obtener tickets de compra (Usuario autenticado):**
    `GET /api/tickets`
    (Devuelve los tickets asociados al usuario logueado.)

Consulta la colección de Postman para ver todos los endpoints disponibles, sus parámetros, cuerpos de solicitud esperados y ejemplos de respuesta.

## 📄 Documentación de la API con Swagger

La API cuenta con documentación interactiva generada con Swagger (OpenAPI). Esto permite explorar los endpoints disponibles, sus parámetros, modelos de datos y probar las solicitudes directamente desde el navegador.

Para acceder a la documentación de Swagger, una vez que el servidor esté corriendo (ya sea localmente o en Docker), navega a la siguiente URL:

`http://localhost:PORT/api-docs`

(Reemplaza `PORT` con el puerto en el que esté corriendo la aplicación, por defecto 8080).

##  Documentación de la API con Swagger

La API cuenta con documentación interactiva generada con Swagger (OpenAPI). Esto permite explorar los endpoints disponibles, sus parámetros, modelos de datos y probar las solicitudes directamente desde el navegador.

Para acceder a la documentación de Swagger, una vez que el servidor esté corriendo (ya sea localmente o en Docker), navega a la siguiente URL:

`http://localhost:PORT/api-docs`

(Reemplaza `PORT` con el puerto en el que esté corriendo la aplicación, por defecto 8080).

## 🐳 Docker

Este proyecto está disponible como una imagen Docker en Docker Hub. Puedes descargarla y ejecutarla fácilmente.

1.  **Descargar la imagen Docker:**
    ```bash
    docker pull juanpirriv/nodejs-auth-api
    ```

2.  **Ejecutar el contenedor:**
    Asegúrate de tener un archivo `.env` configurado localmente con las variables de entorno necesarias (especialmente `MONGO_URI`). Luego, puedes ejecutar el contenedor mapeando el puerto y montando el archivo `.env`:
    ```bash
    docker run -d -p 8080:8080 --env-file .env juanpirriv/nodejs-auth-api
    ```
    Reemplaza `8080:8080` si necesitas mapear a un puerto diferente en tu máquina local. El contenedor leerá las variables de entorno desde el archivo `.env` que le montes.

Puedes encontrar la imagen en Docker Hub aquí: [https://hub.docker.com/repository/docker/juanpirriv/nodejs-auth-api](https://hub.docker.com/repository/docker/juanpirriv/nodejs-auth-api)

## ✅ Tecnologías Usadas

*   **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
*   **Docker**: Plataforma para desarrollar, enviar y ejecutar aplicaciones en contenedores.
*   **Swagger (OpenAPI)**: Para generar documentación interactiva de la API.
*   **Express.js**: Framework web para Node.js, utilizado para construir la API.
*   **MongoDB**: Base de datos NoSQL orientada a documentos.
*   **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js.
*   **JWT (JSON Web Tokens)**: Para la autenticación stateless.
*   **Passport.js**: Middleware de autenticación para Node.js (con estrategias `passport-jwt` y `passport-local`).
*   **Joi**: Para la validación de datos de entrada.
*   **Winston**: Logger versátil para Node.js.
*   **Dotenv**: Para cargar variables de entorno desde un archivo `.env`.
*   **Bcrypt**: Para el hashing de contraseñas.
*   **Nodemailer**: Para el envío de correos electrónicos.
*   **Twilio SDK**: Para la integración con servicios de Twilio (SMS).
*   Y otras dependencias listadas en `package.json`.

## 📎 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles (si no existe, puedes crear uno con el texto estándar de la licencia MIT).

```text
MIT License

Copyright (c) [2025] [JuanpiRiv]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
 `[2025]` y `[Juan Pablo Rivero Albornoz]` .

##  Contacto / Autor

Desarrollado por **[JuanpiRiv]**

*   GitHub: `[https://github.com/juanpiRiv]`
*   Email: `[juanpirivero015@gmail.com]`
*   LinkedIn: `[https://www.linkedin.com/in/juanriveroalbornoz/]`

---

¡Gracias por usar este proyecto!

## 🧪 Testing

This project uses Mocha, Chai, and Supertest for testing the API.

### Mocha

Mocha is a JavaScript test framework that runs on Node.js and in the browser. It allows you to define test suites and test cases using a simple and intuitive syntax.

#### Key Concepts

*   **Test Suite:** A group of related tests, defined using the `describe` function.
*   **Test Case:** An individual test, defined using the `it` function.
*   **Hooks:** Functions that run before or after test cases, such as `before` (runs before all tests) and `after` (runs after all tests).

#### Example

```javascript
describe('Carts API', () => {
    // Setup: Crear usuarios y establecer sesiones con cookies
    before(async () => {
        // ...
    });

    describe('POST /api/carts', () => {
        it('debería crear un carrito con sesión de usuario regular', async () => {
            // ...
        });
    });

    // Cleanup después de los tests
    after(async () => {
        // ...
    });
});
```

### Chai

Chai is an assertion library that provides a variety of assertion styles, making it easy to write expressive and readable tests.

#### Key Concepts

*   **Expect:** A function used to make assertions about the expected behavior of the code.
*   **Assertion Styles:** Chai provides several assertion styles, such as `expect`, `should`, and `assert`.

#### Example

```javascript
it('debería crear un carrito con sesión de usuario regular', async () => {
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
});
```

### Supertest

Supertest is a library for testing HTTP APIs. It allows you to make HTTP requests to the server and assert the expected responses.

#### Key Concepts

*   **Agent:** An object that maintains cookies and session information across requests.
*   **HTTP Methods:** Supertest provides methods for making different types of HTTP requests, such as `get`, `post`, `put`, and `delete`.
*   **Send:** A method for sending data with the request (e.g., in the request body for POST and PUT requests).

#### Example

```javascript
it('debería crear un carrito con sesión de usuario regular', async () => {
    const res = await userAgent
        .post('/api/carts');

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
});
```

### Swagger

Swagger is a specification and framework for documenting APIs. It allows you to define the API endpoints, request parameters, and response formats in a standardized way.

#### Key Concepts

*   **API Documentation:** A document that describes the API endpoints, request parameters, and response formats.
*   **Swagger UI:** A user interface for exploring the API documentation.

#### Example

The Swagger documentation for this API is available at http://localhost:8080/api/docs/. It provides a comprehensive overview of all the available endpoints and their parameters.

For example, the documentation for the `POST /api/carts` endpoint shows that it creates a new cart.

```
POST /api/carts
```

This endpoint requires authentication.

### Complete Supertest Example

```javascript
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
            const fakeCart
