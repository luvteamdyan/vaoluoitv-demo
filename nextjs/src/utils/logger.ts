/**
 * Logger utility for development and production environments
 * Automatically disables logging in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableConsole: boolean;
  enableFile?: boolean;
  logLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = {
      enableConsole: this.isDevelopment,
      logLevel: this.isDevelopment ? 'debug' : 'error',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableConsole) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      // Debug logging disabled - parameters kept for interface compatibility
      void message;
      void args;
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  // Special methods for common use cases
  api(message: string, ...args: unknown[]): void {
    this.debug(`[API] ${message}`, ...args);
  }

  component(message: string, ...args: unknown[]): void {
    this.debug(`[COMPONENT] ${message}`, ...args);
  }

  hook(message: string, ...args: unknown[]): void {
    this.debug(`[HOOK] ${message}`, ...args);
  }

  service(message: string, ...args: unknown[]): void {
    this.debug(`[SERVICE] ${message}`, ...args);
  }

  // Group logging for better organization
  group(label: string, fn: () => void): void {
    if (this.config.enableConsole) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }

  // Table logging for arrays and objects
  table(data: unknown, message?: string): void {
    if (this.config.enableConsole) {
      if (message) {
        // Table logging disabled
      }
      // Table logging disabled
    }
  }

  // Time measurement
  time(label: string): void {
    if (this.config.enableConsole) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.enableConsole) {
      console.timeEnd(label);
    }
  }

  // Clear console (only in development)
  clear(): void {
    if (this.config.enableConsole) {
      console.clear();
    }
  }

  // Update configuration
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Check if logging is enabled
  isEnabled(): boolean {
    return this.config.enableConsole;
  }

  // Get current environment
  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the instance and the class
export default logger;
export type { Logger, LoggerConfig, LogLevel };