import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `[${level.toUpperCase()}] ${timestamp}: ${message}`;
    })
  ),
  transports: [
    new transports.Console()
  ],
});
