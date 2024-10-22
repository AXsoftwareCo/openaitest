import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  let coloredMessage = message;
  if (typeof message === 'object') {
    coloredMessage = JSON.stringify(message, null, 2);
  }
  return chalk.yellow(`[${timestamp}] `) + chalk.blue(`[${level}]: `) + chalk.white(coloredMessage);
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'shopbot-plus' },
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ]
});

export default logger;