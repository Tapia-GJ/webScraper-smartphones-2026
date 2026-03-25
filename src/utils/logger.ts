import winston from 'winston';
import { config } from '../config';
import path from 'path';

/**
 * Logger profesional usando Winston
 * Guarda los logs en archivos separados (info, error) y también muestra en consola
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'kimovil-scraper' },
  transports: [
    // Logs de errores en archivo separado
    new winston.transports.File({
      filename: path.join(config.output.logsPath, 'error.log'),
      level: 'error'
    }),
    // Todos los logs (incluyendo info) en otro archivo
    new winston.transports.File({
      filename: path.join(config.output.logsPath, 'combined.log')
    })
  ]
});

// En desarrollo, también mostramos los logs en consola con formato legible
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

export default logger;
