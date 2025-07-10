import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.initLogger();
  }

  /*用于实例化的时候给到context*/
  setContext(context: string) {
    this.context = context;
    return this;
  }

  private initLogger() {
    /*日志存放路径*/
    const logDir = path.join(process.cwd(), 'logs');

    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    /*定义日志格式*/
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        // 统一处理 context 的优先级
        const usedContext = context || this.context;
        const contextMessage = usedContext ? ` [${usedContext}]` : '';
        const traceMessage = trace ? `\n${trace}` : '';
        return `[${timestamp}] ${level.toUpperCase()}${contextMessage}: ${message}${traceMessage}`;
      }),
    );

    // 创建日志轮转实例
    const infoTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '14d', // 保留14天
      maxSize: '20m', // 单个文件最大20M
    });

    const errorTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
    });

    infoTransport.on('error', (error) => {
      console.error('Info log file error:', error);
    });

    errorTransport.on('error', (error) => {
      console.error('Error log file error:', error);
    });

    /*创建 winston logger 实例*/
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: customFormat,
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            customFormat,
          ),
        }),
        infoTransport,
        errorTransport,
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, error?: Error | string | unknown, context?: string) {
    let trace: string | undefined;

    if (error instanceof Error) {
      trace = error.stack;
    } else if (typeof error === 'string') {
      trace = error;
    } else if (error) {
      trace = JSON.stringify(error);
    }

    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
