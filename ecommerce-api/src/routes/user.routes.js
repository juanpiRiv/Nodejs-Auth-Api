import express from 'express';
import passport from 'passport'; // Asumiendo que usas Passport
import UserDTO from '../dtos/user.dto.js';

const router = express.Router();

// Middleware de autenticación (ajusta 'jwt' según tu estrategia)
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Ruta para obtener el usuario actual
router.get('/current', authenticateJWT, (req, res) => {
    // req.user es establecido por el middleware de autenticación (Passport)
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No user authenticated' });
    }

    // Crear y devolver el DTO del usuario
    const userDTO = new UserDTO(req.user);
    res.status(200).json({ status: 'success', user: userDTO });
});

// Puedes añadir otras rutas de usuario aquí (registro, login, etc.)

export default router;
