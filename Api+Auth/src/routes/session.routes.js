import express from 'express';
import passport from 'passport';
import { login, register, current, logout } from '../controllers/session.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import UserDTO from '../dtos/user.dto.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { userRegisterSchema } from '../validations/user.validation.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     UserModel:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           description: Nombre del usuario
 *           example: John
 *         last_name:
 *           type: string
 *           description: Apellido del usuario
 *           example: Doe
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario (único)
 *           example: john.doe@example.com
 *         age:
 *           type: integer
 *           description: Edad del usuario
 *           example: 30
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *           example: password123
 *         role:
 *           type: string
 *           description: Rol del usuario
 *           enum: [user, admin]
 *           default: user
 *           example: user
 *       required:
 *         - first_name
 *         - email
 *         - password
 *     UserDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *           example: 64d8f2b6c4b3a7b2a9b8f0a1
 *         first_name:
 *           type: string
 *           description: Nombre del usuario
 *           example: John
 *         last_name:
 *           type: string
 *           description: Apellido del usuario
 *           example: Doe
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *           example: john.doe@example.com
 *         role:
 *           type: string
 *           description: Rol del usuario
 *           enum: [user, admin]
 *           example: user
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/sessions/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: juanpirivero@gmail.com
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: 123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/UserDTO'
 *             examples:
 *               UserLoginSuccess:
 *                 value:
 *                   status: success
 *                   payload:
 *                     id: 64d8f2b6c4b3a7b2a9b8f0a1
 *                     first_name: John
 *                     last_name: Doe
 *                     email: john.doe@example.com
 *                     role: user
 *               AdminLoginSuccess:
 *                 value:
 *                   status: success
 *                   payload:
 *                     id: 64d8f2b6c4b3a7b2a9b8f0a2
 *                     first_name: Jane
 *                     last_name: Smith
 *                     email: jane.smith@example.com
 *                     role: admin
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */
router.post('/login', login); // Consider adding validation for login if needed

/**
 * @openapi
 * /api/sessions/register:
 *   post:
 *     summary: Registro de usuario
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserModel'
 *     responses:
 *       201: # Typically 201 for creation
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario registrado exitosamente
 *             examples:
 *               UserRegistrationSuccess:
 *                 value:
 *                   status: success
 *                   message: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación o usuario existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email already exists or validation failed
 */
router.post('/register', validateBody(userRegisterSchema), register);

/**
 * @openapi
 * /api/sessions/current:
 *   get:
 *     summary: Obtener usuario actual
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/UserDTO'
 *             examples:
 *               CurrentUserUserRole:
 *                 value:
 *                   status: success
 *                   payload:
 *                     id: 64d8f2b6c4b3a7b2a9b8f0a1
 *                     first_name: John
 *                     last_name: Doe
 *                     email: john.doe@example.com
 *                     role: user
 *               CurrentUserAdminRole:
 *                 value:
 *                   status: success
 *                   payload:
 *                     id: 64d8f2b6c4b3a7b2a9b8f0a2
 *                     first_name: Jane
 *                     last_name: Smith
 *                     email: jane.smith@example.com
 *                     role: admin
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/current',
  passport.authenticate('jwt',{session:false}),
  (req,res) => {
    const dto = new UserDTO(req.user);
    res.json({status:'success', payload: dto});
  }
);

/**
 * @openapi
 * /api/sessions/logout:
 *   get:
 *     summary: Cerrar sesión de usuario
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada exitosamente
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/logout', logout);

export default router;
