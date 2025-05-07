// Middleware para verificar si el usuario tiene uno de los roles permitidos
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // Asegurarse de que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: No user logged in' });
        }

        const userRole = req.user.role;

        // Asegurarse de que se proporcionaron roles permitidos
        const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Verificar si el rol del usuario es incluido en los roles permitidos
        if (!rolesToCheck.includes(userRole)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden: User does not have the required role' });
        }

        // Si el rol es permitido, continuar con la siguiente función de middleware/ruta
        next();
    };
};

export default authorize;
