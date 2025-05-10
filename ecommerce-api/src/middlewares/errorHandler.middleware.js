
/**
 * Middleware global para el manejo de errores.
 * Captura los errores y envía una respuesta JSON estandarizada.
 * @param {Error} err - El objeto de error.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  // Loguear el error con Winston
  // El stack trace se incluirá automáticamente por la configuración del logger si se pasa el objeto err.
  let logMessageToRecord = err.message;
  // Si el error no tiene un statusCode (es decir, no es un error HTTP que hayamos construido explícitamente),
  // entonces anteponemos la información de la solicitud para mayor contexto.
  // Para errores con statusCode (como nuestros 404), err.message ya suele ser suficientemente descriptivo.
  if (!err.statusCode) {
    logMessageToRecord = `${req.method} ${req.originalUrl} - ${err.message}`;
    // Para errores genéricos, pasamos el objeto error completo para que Winston lo procese.
    logger.error(logMessageToRecord, err);
  } else {
    // Para errores construidos (con statusCode), logueamos el mensaje y explícitamente el stack y statusCode.
    // Esto evita la duplicación del mensaje que a veces ocurre con format.errors().
    logger.error(logMessageToRecord, {
      stack: err.stack,
      statusCode: err.statusCode,
      // Si 'err' tuviera otras propiedades personalizadas que quieras loguear, añádelas aquí.
    });
  }

  const statusCode = err.statusCode || 500; // Usar el statusCode del error si existe, sino 500
  const message = err.message || 'Ocurrió un error interno en el servidor.';

  // Enviar una respuesta JSON consistente
    res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Opcionalmente, se puede incluir el stack trace en desarrollo
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorHandler;
