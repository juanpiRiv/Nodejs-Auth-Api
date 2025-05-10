import winston from 'winston';

// Definir niveles de logging personalizados si es necesario (opcional)
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'redBG',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
    },
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), // Para loguear el stack trace de los errores
        winston.format.splat(),
        winston.format.json() // Formato JSON para los archivos de log
    ),
    transports: [
        // Transporte para la consola
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Nivel diferente para producción y desarrollo
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(), // Formato simple para la consola
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + (info.stack ? `\n${info.stack}` : ''))
            ),
        }),
        // Transporte para guardar logs de error en un archivo
        new winston.transports.File({
            filename: 'errors.log', // Nombre del archivo
            level: 'error', // Solo logs de nivel 'error' o superior (fatal)
            dirname: './logs', // Directorio donde se guardarán los logs (se creará si no existe)
            maxsize: 5242880, // 5MB tamaño máximo del archivo
            maxFiles: 5, // Número máximo de archivos a mantener
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        }),
        // Opcional: Transporte para guardar todos los logs en otro archivo
        new winston.transports.File({
            filename: 'combined.log',
            level: 'debug', // Todos los logs desde debug hacia arriba
            dirname: './logs',
            maxsize: 5242880, // 5MB
            maxFiles: 3,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        })
    ],
    exceptionHandlers: [
        // Para capturar excepciones no controladas
        new winston.transports.File({
            filename: 'exceptions.log',
            dirname: './logs',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        })
    ],
    rejectionHandlers: [
        // Para capturar promesas rechazadas no controladas
        new winston.transports.File({
            filename: 'rejections.log',
            dirname: './logs',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        })
    ],
    exitOnError: false, // No salir en caso de excepción no controlada manejada por Winston
});

// Ejemplo de cómo usar el logger:
// logger.error('Este es un error de prueba');
// logger.warn('Esta es una advertencia');
// logger.info('Información general');
// logger.http('Solicitud HTTP recibida');
// logger.debug('Mensaje de depuración detallado');

export default logger;
