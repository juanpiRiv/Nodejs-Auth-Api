/**
 * Middleware para manejar rutas no encontradas (404).
 * Si una solicitud llega aquí, significa que ninguna ruta anterior coincidió.
 * Crea un error 404 y lo pasa al siguiente middleware de manejo de errores.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // Pasa el error al errorHandler global
};

export default notFoundHandler;
