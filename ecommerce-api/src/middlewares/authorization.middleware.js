// Middleware para verificar si el usuario tiene uno de los roles permitidos
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // Asegurarse de que el usuario esté autenticado (req.user debe ser establecido por un middleware de autenticación previo, como Passport)
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: No user logged in' });
        }

        const userRole = req.user.role;

        // Convertir allowedRoles a array si no lo es, para manejar un solo rol o múltiples roles
        const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Verificar si el rol del usuario está incluido en los roles permitidos
        if (!rolesToCheck.includes(userRole)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden: User does not have the required role' });
        }

        // Si el rol es permitido, continuar con la siguiente función de middleware/ruta
        next();
    };
};

export default authorize;
