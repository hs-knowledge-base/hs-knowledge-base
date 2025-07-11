export interface LoggerConfig {
  logDir?: string;
  maxFiles?: string;
  maxSize?: string;
  datePattern?: string;
  level?: string;
}

export interface LogFormat {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  trace?: string;
}
