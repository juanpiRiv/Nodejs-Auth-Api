import logger from '../config/logger.js';

/**
 * Middleware para registrar información de las solicitudes HTTP entrantes.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
const httpLogger = (req, res, next) => {
    // Guardamos el método original de 'end' para interceptar la finalización de la respuesta
    const oldEnd = res.end;

    // Capturamos el tiempo de inicio de la solicitud
    const startTime = process.hrtime();

    res.end = (...args) => {
        // Calculamos el tiempo de respuesta
        const diff = process.hrtime(startTime);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3); // en milisegundos

        // Logueamos la información de la solicitud y la respuesta
        logger.http(
            `${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms) - ${req.ip} - ${req.get('User-Agent') || ''}`
        );
        oldEnd.apply(res, args);
    };

    next();
};

export default httpLogger;
