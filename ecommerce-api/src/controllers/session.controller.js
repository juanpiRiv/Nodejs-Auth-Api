import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import { hashPassword, comparePasswords } from '../utils/auth.utils.js';
import jwtUtils from '../utils/jwt.utils.js'; // Importa la instancia directamente
import { config } from '../config/config.js';
import cookieParser from 'cookie-parser';
import userService from '../services/user.service.js';

const register = (req, res, next) => {
    passport.authenticate('register', { session: false, failWithError: true }, (err, user, info) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message || 'Error en el registro' });
        }
        const userWithoutPassword = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role,
            _id: user._id,
            __v: user.__v
        };
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado correctamente',
            user: userWithoutPassword
        });
    })(req, res, next);
};

const login = (req, res, next) => {
    passport.authenticate('login', { session: false, failWithError: true }, async (err, user, info) => {
        if (err) {
            return res.status(401).json({ status: 'error', message: err.message });
        }
        try {
            const token = jwtUtils.generateToken({
                _id: user._id,
                email: user.email,
                role: user.role
            });

            res.cookie('authToken', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
                sameSite: 'strict'
            });

            const payload = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role
            };

            res.status(200).json({
                status: 'success',
                message: 'Login exitoso',
                payload: payload
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    })(req, res, next);
};

const current = async (req, res) => {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwtUtils.verifyToken(token);

    const user = await userModel.findById(decoded.sub);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userWithoutPassword = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
      _id: user._id,
      __v: user.__v
    };
    res.status(200).json({ status: 'success', message: 'Current user', user: userWithoutPassword });
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
