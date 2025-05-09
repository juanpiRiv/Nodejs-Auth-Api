
/**
 * Middleware global para el manejo de errores.
 * Captura los errores y envía una respuesta JSON estandarizada.
 * @param {Error} err - El objeto de error.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Registrar el stack trace del error en la consola (se puede expandir a un logger más robusto)

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
