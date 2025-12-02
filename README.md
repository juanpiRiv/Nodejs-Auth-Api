# Proyecto E-commerce API

Backend para e-commerce con Node.js, Express y MongoDB. Incluye autenticación con JWT/Passport, roles, carritos, tickets, pagos con Mercado Pago, emails con Nodemailer y SMS con Twilio.

## 🚀 Instalación rápida
```bash
git clone https://github.com/juanpiRiv/Nodejs-Auth-Api
cd Api+Auth
npm install
cp .env.example .env    # completa tus credenciales
npm run dev
```

## 🔧 Variables de entorno
Completa `.env` (usa `.env.example` como guía):
- Básicas: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_COOKIE_NAME`
- Email: `MAIL_USER`, `MAIL_PASS` (password de aplicación si usas Gmail)
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`, `ADMIN_PHONE`
- Mercado Pago: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`
- `BASE_URL`: URL pública HTTPS (ej. dominio ngrok) usada por el webhook/back_urls de MP

## 💳 Flujo Mercado Pago (sandbox/prod)
1) **Configura `.env`** con `BASE_URL` https y credenciales MP (usa `TEST-...` en sandbox).  
2) **Inicia pago (auth requerida)**  
   `POST /api/carts/:cid/pay` (alias `/api/carts/:cid/payment/start`) → devuelve `preferenceId`, `init_point`, `sandbox_init_point`.  
3) **Checkout**: abre `init_point` y paga (en sandbox usa tarjeta de prueba, ej. Visa 4509 9535 6623 3704, CVV 123, vto futuro, DNI 12345678).  
4) **Webhook**: MP llama `POST /api/carts/payment/webhook`. El backend verifica el pago aprobado, descuenta stock, crea ticket, envía email y limpia el carrito.  
5) **Back URLs**: `/api/carts/payment/success|failure|pending` evitan 404 al volver del checkout.  
6) **Tickets del usuario**: `GET /api/tickets/mine` o `/api/tickets/mine/latest` (usa cookie JWT `authToken` o Bearer según tu cliente).

## 📚 Swagger
Documentación en `http://localhost:8080/api-docs` (ajusta puerto). Incluye rutas de pago, webhook y el resto de recursos.

## 🔑 Roles
- `user`: puede gestionar su carrito, pagar y ver sus tickets.  
- `admin`: además puede ver/gestionar todos los recursos (productos, usuarios, tickets).

## 📂 Estructura (resumen)
```
Api+Auth/
├── src/
│   ├── config/        # passport, logger, etc.
│   ├── controllers/   # lógica HTTP
│   ├── dao/models/    # modelos Mongoose
│   ├── repositories/  # capa de acceso a datos
│   ├── services/      # negocio + integraciones externas
│   ├── routes/        # rutas Express
│   └── server.js
├── logs/              # generado en runtime (ignorar en git)
├── .env.example
└── Auth+Api.postman_collectionv2.json
```

## 🧪 Tests
Mocha + Chai + Supertest. Ejecuta `npm test` (requiere Mongo accesible según config de pruebas).

## 🐳 Docker
Imagen publicada: `docker pull juanpirriv/nodejs-auth-api:1.1.0` (también `latest`).  
Ejecución típica: 
```bash
docker pull juanpirriv/nodejs-auth-api:1.1.0
docker run -d -p 8080:8080 --env-file .env juanpirriv/nodejs-auth-api:1.1.0
```

## Notas
- No mezcles credenciales PROD con tarjetas de prueba; en sandbox usa `TEST-...` y `sandbox_init_point`.
- Mantén `logs/*.log` en `.gitignore` y rota claves sensibles si las compartiste.

##  Autor


Desarrollado por **[JuanpiRiv]**

*   GitHub: `[https://github.com/juanpiRiv]`
*   Email: `[juanpirivero015@gmail.com]`
*   LinkedIn: `[https://www.linkedin.com/in/juanriveroalbornoz/]`

---

¡Gracias por usar este proyecto!
