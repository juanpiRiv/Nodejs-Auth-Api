import passport from 'passport';
import jwtUtils from '../utils/jwt.utils.js';
import userService from '../services/user.service.js';

const register = async (req, res, next) => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado correctamente',
            user: result.user
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        res.cookie('authToken', result.token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            sameSite: 'strict'
        });

        res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            payload: result.user
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(401).json({ status: 'error', message: error.message });
    }
};

const current = async (req, res) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwtUtils.verifyToken(token);
        const userId = decoded.sub;

        const user = await userService.getCurrentUser(userId);

        res.status(200).json({ status: 'success', message: 'Current user', user });
    } catch (error) {
        console.error(error);
        res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

const logout = (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logout successful' });
};

export {
    register,
    login,
    current,
    logout
};
