import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private logHistory: LogMessage[] = [];

  // Private constructor for singleton pattern
  private constructor() {
    // Intentionally empty - initialization is done through instance properties
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const coloredLevel = this.colorLevel(level);
    let formattedMessage = `${timestamp} ${coloredLevel}: ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        formattedMessage += `\n${data.stack || data.message}`;
      } else {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      }
    }
    
    return formattedMessage;
  }

  private colorLevel(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return chalk.gray('DEBUG');
      case 'info':
        return chalk.blue('INFO');
      case 'warn':
        return chalk.yellow('WARN');
      case 'error':
        return chalk.red('ERROR');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return logLevelOrder.indexOf(level) >= logLevelOrder.indexOf(this.logLevel);
  }

  private logInternal(messageOrLevel: string | LogLevel, levelOrMessage?: LogLevel | string, data?: unknown): void {
    let level: LogLevel = 'info';
    let message: string;

    // Determine the correct level and message based on argument types
    if (typeof messageOrLevel === 'string' && typeof levelOrMessage === 'string') {
      // Ensure levelOrMessage is a valid LogLevel
      level = levelOrMessage as LogLevel;
      message = messageOrLevel;
    } else if (typeof messageOrLevel === 'string') {
      message = messageOrLevel;
      // Ensure levelOrMessage is a valid LogLevel or default to 'info'
      level = levelOrMessage && ['debug', 'info', 'warn', 'error'].includes(levelOrMessage as string) 
        ? levelOrMessage as LogLevel 
        : 'info';
    } else {
      // Ensure messageOrLevel is a valid LogLevel
      level = messageOrLevel as LogLevel;
      message = levelOrMessage as string;
    }

    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, data);
      console.log(formattedMessage);

      // Store log message in history
      this.logHistory.push({
        level,
        message,
        timestamp: new Date(),
        data
      });
    }
  }

  public log(message: string, level: LogLevel = 'info', data?: unknown): void {
    this.logInternal(message, level, data);
  }

  debug(message: string, data?: unknown): void {
    this.logInternal('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.logInternal('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logInternal('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.logInternal('error', message, data);
  }

  success(message: string, data?: unknown): void {
    this.logInternal('info', message, data);
  }

  getHistory(): LogMessage[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

export const logger = Logger.getInstance();
