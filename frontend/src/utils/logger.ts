/**
 * Logger utility that only logs in development mode
 * In production (EC2), console methods are no-op functions
 */

const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

export const logger = {
  log: isDevelopment ? console.log.bind(console) : () => {},
  debug: isDevelopment ? console.debug.bind(console) : () => {},
  info: isDevelopment ? console.info.bind(console) : () => {},
  warn: isDevelopment ? console.warn.bind(console) : () => {},
  error: isDevelopment ? console.error.bind(console) : () => {},
};

// For drop-in replacement of console
export default logger;
