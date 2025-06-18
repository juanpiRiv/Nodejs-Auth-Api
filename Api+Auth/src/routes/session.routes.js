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
 *                 example: juanpirivero@gmail.com
 *               password:
 *                 type: string
 *                 example: 123
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
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64d8f2b6c4b3a7b2a9b8f0a1
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     age:
 *                       type: integer
 *                       example: 30
 *                     role:
 *                       type: string
 *                       example: user
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
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Diego
 *               last_name:
 *                 type: string
 *                 example: Polverelli
 *               email:
 *                 type: string
 *                 example: diegopolverelli80@gmail.com
 *               age:
 *                 type: integer
 *                 example: 46
 *               password:
 *                 type: string
 *                 example: 123
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
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
 *                   example: Usuario registrado
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
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64d8f2b6c4b3a7b2a9b8f0a1
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     age:
 *                       type: integer
 *                       example: 30
 *                     role:
 *                       type: string
 *                       example: user
 */
router.get('/current',
  passport.authenticate('jwt',{session:false}),
  (req,res) => {
    const dto = new UserDTO(req.user);
    res.json({status:'success', payload: dto});
  }
);

router.get('/logout', logout);

export default router;
