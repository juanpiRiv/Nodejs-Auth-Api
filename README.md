# Proyecto E-commerce API

API backend robusta y profesional para una plataforma de e-commerce, desarrollada con Node.js, Express y MongoDB. Incluye:
- Autenticación
- Autorización por roles
- Gestión de carrito de compras
- Sistema de tickets
- Y más funcionalidades.

## 📦 Instalación

Sigue estos pasos para ejecutar el proyecto localmente:

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
├── .env                # Archivo de variables de entorno (NO subir a Git, incluir en Docker)
├── .dockerignore       # Archivos y carpetas ignorados por Docker (no incluir en Git)
├── .gitignore          # Archivos y carpetas ignorados por Git (no incluir en Docker)
├── Dockerfile          # Imagen Docker para ejecución en entornos de producción
├── package-lock.json   # Dependencias bloqueadas
├── package.json        # Metadatos del proyecto y dependencias
└── README.md           # Este archivo
```

## 🧪 Uso de la colección Postman

Se proporciona una colección de Postman (`Auth+Api.postman_collectionv2.json`) con todos los endpoints listos para ser probados.

**Cómo importar y usar:**

1.  Abre Postman.
2.  Haz clic en `Import` (generalmente en la esquina superior izquierda).
3.  Selecciona la pestaña `File` y luego `Upload Files`.
4.  Navega hasta el archivo `Auth+Api.postman_collectionv2.json` en la raíz del proyecto y selecciónalo.
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

*   **Mocha**: Framework de testing para JavaScript.
*   **Chai**: Librería de aserciones para testing en JavaScript.
*   **Supertest**: Librería para testing de APIs HTTP en Node.js.
*   **Swagger (OpenAPI)**: Para generar documentación interactiva de la API.
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
## 🧪 Testing

This project uses Mocha, Chai, and Supertest for testing the API.

### Mocha

Mocha is a JavaScript test framework that runs on Node.js and in the browser. It allows you to define test suites and test cases using a simple and intuitive syntax.


#### Example

The Swagger documentation for this API is available at http://localhost:8080/api/docs/. It provides a comprehensive overview of all the available endpoints and their parameters.

For example, the documentation for the `POST /api/carts` endpoint shows that it creates a new cart.

```
POST /api/carts
```

This endpoint requires authentication.

### Testing con Mocha, Chai y Supertest

Este proyecto utiliza Mocha, Chai y Supertest para realizar pruebas automatizadas de la API.

#### Configuración de las Pruebas

1.  **Instalación de Dependencias:**
    Asegúrate de tener instaladas las dependencias de desarrollo necesarias:
    ```bash
    npm install --save-dev mocha chai supertest
    ```

2.  **Ejecución de las Pruebas:**
    Para ejecutar las pruebas, utiliza el siguiente comando:
    ```bash
    npm test
    ```
    Este comando ejecutará todos los archivos de prueba ubicados en el directorio `test/`.

#### Estructura de las Pruebas

Los archivos de prueba se encuentran en el directorio `test/` y siguen una estructura similar a la siguiente:

```
test/
├── cart.test.js
├── product.test.js
├── session.test.js
└── ticket.test.js
```

Cada archivo de prueba contiene pruebas para una funcionalidad específica de la API.

#### Mocha

Mocha es un framework de pruebas de JavaScript que se ejecuta en Node.js y en el navegador. Permite definir suites de pruebas y casos de prueba utilizando una sintaxis simple e intuitiva.

##### Conceptos Clave

*   **Suite de Pruebas:** Un grupo de pruebas relacionadas, definido utilizando la función `describe`.
*   **Caso de Prueba:** Una prueba individual, definida utilizando la función `it`.
*   **Hooks:** Funciones que se ejecutan antes o después de los casos de prueba, como `before` (se ejecuta antes de todas las pruebas) y `after` (se ejecuta después de todas las pruebas).


#### Chai

Chai es una librería de aserciones que proporciona una variedad de estilos de aserción, lo que facilita la escritura de pruebas expresivas y legibles.

##### Conceptos Clave

*   **Expect:** Una función utilizada para realizar aserciones sobre el comportamiento esperado del código.
*   **Estilos de Aserción:** Chai proporciona varios estilos de aserción, como `expect`, `should` y `assert`.


#### Supertest

Supertest es una librería para probar APIs HTTP. Permite realizar solicitudes HTTP al servidor y verificar las respuestas esperadas.

##### Conceptos Clave

*   **Agent:** Un objeto que mantiene las cookies y la información de sesión a través de las solicitudes.
*   **Métodos HTTP:** Supertest proporciona métodos para realizar diferentes tipos de solicitudes HTTP, como `get`, `post`, `put` y `delete`.
*   **Send:** Un método para enviar datos con la solicitud (por ejemplo, en el cuerpo de la solicitud para las solicitudes POST y PUT).

##### Ejemplo

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
 `[2025]` y `[JuanpiRiv]` .

##  Autor

Desarrollado por **[JuanpiRiv]**

*   GitHub: `[https://github.com/juanpiRiv]`
*   Email: `[juanpirivero015@gmail.com]`
*   LinkedIn: `[https://www.linkedin.com/in/juanriveroalbornoz/]`

---

¡Gracias por usar este proyecto!
