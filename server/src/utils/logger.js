import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for local development
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'shopsphere-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Always log to console, especially important for platforms like Railway
logger.add(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' 
      ? combine(timestamp(), winston.format.json()) 
      : combine(colorize(), myFormat),
  })
);

export default logger;
