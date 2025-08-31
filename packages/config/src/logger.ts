import pino from 'pino';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create base logger configuration
const pinoConfig: pino.LoggerOptions = {
  level: LOG_LEVEL,
  
  // Pretty print in development, structured JSON in production
  ...(NODE_ENV === 'development' 
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
          log: (object) => ({
            ...object,
            timestamp: new Date().toISOString(),
          }),
        },
      }
  ),
  
  // Base fields included in every log entry
  base: {
    pid: process.pid,
    environment: NODE_ENV,
    service: process.env.SERVICE_NAME || 'mesrai-ai',
  },
};

// Create the base logger instance
export const logger = pino(pinoConfig);

// Helper function to create child loggers with context
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Specialized loggers for different components
export const webhookLogger = createLogger({ component: 'webhook' });
export const workerLogger = createLogger({ component: 'worker' });
export const githubLogger = createLogger({ component: 'github-api' });
export const dbLogger = createLogger({ component: 'database' });
export const authLogger = createLogger({ component: 'auth' });

// Request logger middleware helper
export function createRequestLogger(requestId: string, path: string, method: string) {
  return createLogger({
    component: 'api',
    requestId,
    path,
    method,
  });
}

// Job logger helper
export function createJobLogger(jobId: string, queueName: string, jobType: string) {
  return createLogger({
    component: 'job',
    jobId,
    queueName,
    jobType,
  });
}

// Installation logger helper
export function createInstallationLogger(installationId: number) {
  return createLogger({
    component: 'installation',
    installationId,
  });
}

// Repository logger helper
export function createRepositoryLogger(repositoryId: number, fullName?: string) {
  return createLogger({
    component: 'repository',
    repositoryId,
    ...(fullName && { repositoryFullName: fullName }),
  });
}

// Export logger levels for conditional logging
export const LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
} as const;