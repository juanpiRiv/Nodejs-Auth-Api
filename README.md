# Proyecto E-commerce API

Backend para e-commerce con Node.js, Express y MongoDB. Incluye JWT/Passport, roles, carritos, tickets, pagos con Mercado Pago, emails con Nodemailer y SMS con Twilio.

## 🚀 Instalación rápida
```bash
git clone https://github.com/juanpiRiv/Nodejs-Auth-Api
cd Api+Auth
npm install
cp .env.example .env    # completa tus credenciales (no subas .env real al repo)
npm run dev
```

## 🔑 Variables de entorno
Completa `.env` (usa `.env.example` como guía):
- Básicas: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_COOKIE_NAME`
- Email: `MAIL_USER`, `MAIL_PASS` (usa contraseña de aplicación si es Gmail)
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`, `ADMIN_PHONE`
- Mercado Pago: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`
- `BASE_URL`: URL pública HTTPS (ej. dominio ngrok) para webhook/back_urls de MP

## 🧭 Flujo Mercado Pago (sandbox/prod)
1) Configura `.env` con `BASE_URL` https y credenciales MP (`TEST-...` en sandbox).  
2) Inicia pago (auth requerida): `POST /api/carts/:cid/pay` (alias `/api/carts/:cid/payment/start`) devuelve `preferenceId`, `init_point`, `sandbox_init_point`.  
3) Checkout: abre `init_point` y paga (sandbox: Visa 4509 9535 6623 3704, CVV 123, vto futuro, DNI 12345678).  
4) Webhook: MP llama `POST /api/carts/payment/webhook`; se valida pago aprobado, se descuenta stock, se crea ticket, se envía email y se limpia el carrito.  
5) Back URLs: `/api/carts/payment/success|failure|pending` evitan 404 al volver del checkout.  
6) Tickets del usuario: `GET /api/tickets/mine` o `/api/tickets/mine/latest` (cookie JWT `authToken` o Bearer).

## 📜 Swagger
Documentación en `http://localhost:8080/api/docs` (ajusta puerto). Incluye rutas de pago, webhook y el resto de recursos.

## 🔒 Roles
- `user`: gestiona su carrito, paga y ve sus tickets.  
- `admin`: gestiona todos los recursos (productos, usuarios, tickets).

## 🗂️ Estructura (resumen)
```
Api+Auth/
├─ src/
│  ├─ config/        # passport, logger, etc.
│  ├─ controllers/   # lógica HTTP
│  ├─ dao/models/    # modelos Mongoose
│  ├─ repositories/  # capa de acceso a datos
│  ├─ services/      # negocio + integraciones externas
│  ├─ routes/        # rutas Express
│  └─ server.js
├─ logs/              # generado en runtime (ignorar en git)
├─ .env.example
└─ Auth+Api.postman_collectionv2.json
```

## ✅ Tests
Mocha + Chai + Supertest. Ejecuta `npm test` (requiere Mongo accesible según la config de pruebas).

## 🐳 Docker
Imagen publicada: `docker pull juanpirriv/nodejs-auth-api:1.1.0` (también `latest`).
```bash
docker pull juanpirriv/nodejs-auth-api:1.1.0
docker run -d -p 8080:8080 --env-file .env juanpirriv/nodejs-auth-api:1.1.0
```

## Notas
- No mezcles credenciales productivas con tarjetas de prueba; en sandbox usa `TEST-...` y `sandbox_init_point`.
- Mantén `logs/*.log` ignorados y rota claves sensibles si se filtraron.
- Para deploy, ajusta `BASE_URL` y configura el webhook de Mercado Pago al dominio público.

## Autor
Desarrollado por **JuanpiRiv**

- GitHub: https://github.com/juanpiRiv
- Email: juanpirivero015@gmail.com
- LinkedIn: https://www.linkedin.com/in/juanriveroalbornoz/

---

Gracias por usar este proyecto!
