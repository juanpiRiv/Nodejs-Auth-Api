import passport from 'passport';

// Middleware de autenticación
export const isAuthenticated = passport.authenticate('jwt', { session: false });

const isAdmin = (req, res, next) => {
    //asume que 'isAuthenticated' req.user
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ status: 'error', message: 'Acceso denegado. Se requiere rol de administrador.' });
};

export {

    isAdmin
};
