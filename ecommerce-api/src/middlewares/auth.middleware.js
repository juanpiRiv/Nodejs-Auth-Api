import passport from 'passport';

const isAuthenticated = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'No autorizado' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
};

export {
    isAuthenticated,
    isAdmin
};
