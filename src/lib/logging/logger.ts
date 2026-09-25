type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  meta?: Record<string, unknown>;
}

// Sensitive keys to scrub from logs
const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'token',
  'accessToken',
  'access_token',
  'authorization',
  'cookie',
  'secret',
  'fileData',
  'content',
]);

function scrubSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(scrubSensitiveData);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = scrubSensitiveData(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export class Logger {
  constructor(private readonly context: string) {}

  public info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const payload: LogPayload = {
      level,
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      meta: meta ? (scrubSensitiveData(meta) as Record<string, unknown>) : undefined,
    };

    const formatted = `[${payload.timestamp}] [${payload.level.toUpperCase()}] [${payload.context}]: ${payload.message}`;
    if (level === 'error') {
      console.error(formatted, payload.meta || '');
    } else if (level === 'warn') {
      console.warn(formatted, payload.meta || '');
    } else {
      console.log(formatted, payload.meta || '');
    }
  }
}
