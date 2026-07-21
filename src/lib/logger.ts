// TAG: utils.logger - Centralized Structured Logger (ARCHITECTURE.md)

/**
 * Centralized structured logger for trip-mapper v1.0.
 *
 * All log output for every function must go through this module.
 * Provides stage-detection logging: entry, step, exit, and error paths.
 *
 * ## Service on/off control
 *
 * Logging can be toggled at three levels:
 *   1. **Build-time**: Set `VITE_LOGGING_ENABLED=false` to disable entirely (dead-code eliminated).
 *   2. **Runtime (localStorage)**: Key `trip-mapper-logging` — `"true"` or `"false"`.
 *   3. **Runtime (API)**: POST to `/__log/toggle` flips the state; GET `/__log/status` reads it.
 *   4. **Runtime (console)**: `window.__tripMapperLog(true)` or `window.__tripMapperLog(false)`.
 *
 * When logging is off, zero console output is produced and no network requests are made.
 *
 * ## Session files
 *
 * During development, the Vite log-writer plugin (`vite-plugins/logWriter.ts`)
 * receives log lines via HTTP POST at `/__log` and writes them to:
 *   `logs/session-YYYY-MM-DDTHH-MM-SS.txt`
 *
 * @tag utils.logger - Centralized Structured Logger (ARCHITECTURE.md)
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

const MIN_LEVEL: LogLevel = 'trace';

const STORAGE_KEY = 'trip-mapper-logging';
const BUILD_ENABLED = import.meta.env?.VITE_LOGGING_ENABLED !== 'false';

// ─── Session buffer ─────────────────────────────────────────────────
const sessionLines: string[] = [];

// ─── Internal state ─────────────────────────────────────────────────
let postTimer: ReturnType<typeof setTimeout> | null = null;
let devServerReachable = true;

// ─── Service on/off ─────────────────────────────────────────────────

function readEnabled(): boolean {
  if (!BUILD_ENABLED) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* localStorage full or unavailable — ignore */
  }
}

function isEnabled(): boolean {
  return readEnabled();
}

// ─── Formatting ─────────────────────────────────────────────────────

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLine(level: LogLevel, context: string, stage: string, message: string, data?: unknown): string {
  const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}] [${context}] [${stage}]`;

  let suffix = '';
  if (data !== undefined) {
    try {
      suffix = ` ${JSON.stringify(data)}`;
    } catch {
      suffix = ` [unserializable: ${String(data)}]`;
    }
  }

  return `${prefix} ${message}${suffix}`;
}

// ─── Transport: console ─────────────────────────────────────────────

function writeConsole(level: LogLevel, line: string): void {
  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

// ─── Transport: session file via POST ───────────────────────────────

function flushToServer(): void {
  if (sessionLines.length === 0) return;
  if (!devServerReachable) return;

  const batch = sessionLines.splice(0);

  fetch('/__log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  }).catch(() => {
    devServerReachable = false;
    // Logs already in sessionLines were spliced — re-add to buffer
    // so they aren't lost if the server comes back.
    sessionLines.unshift(...batch);
  });
}

function scheduleFlush(): void {
  if (postTimer !== null) return;
  postTimer = setTimeout(() => {
    postTimer = null;
    flushToServer();
  }, 200);
}

function bufferLine(line: string): void {
  sessionLines.push(line);
  scheduleFlush();
}

// ─── Core write ─────────────────────────────────────────────────────

function write(level: LogLevel, context: string, stage: string, message: string, data?: unknown): void {
  if (!isEnabled()) return;
  if (!shouldLog(level)) return;

  const line = formatLine(level, context, stage, message, data);

  writeConsole(level, line);
  bufferLine(line);
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Creates a scoped logger bound to a specific function or module.
 * All stages (entry, step, exit, error) are logged under the same context.
 *
 * @tag utils.logger.create - Logger Factory (ARCHITECTURE.md)
 * @param context - The function or module name this logger is bound to
 * @returns An object with entry, step, exit, error, warn, and info methods
 */
export function createLogger(context: string) {
  return {
    entry(params?: unknown): void {
      write('debug', context, 'entry', 'function entered', params);
    },

    step(name: string, data?: unknown): void {
      write('trace', context, 'step', name, data);
    },

    exit(result?: unknown): void {
      write('debug', context, 'exit', 'function exited', result);
    },

    error(err: unknown, stage?: string): void {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      write('error', context, stage ?? 'error', message, stack ? { stack } : undefined);
    },

    warn(message: string, data?: unknown): void {
      write('warn', context, 'warn', message, data);
    },

    info(message: string, data?: unknown): void {
      write('info', context, 'info', message, data);
    },
  };
}

// ─── Runtime toggle API ─────────────────────────────────────────────

/**
 * Enable or disable the logging service at runtime.
 * Persists to localStorage so it survives page reloads.
 *
 * @tag utils.logger.toggle - Runtime Log Toggle (ARCHITECTURE.md)
 * @param enabled - `true` to turn logging on, `false` to turn it off
 */
export function setLoggingEnabled(enabled: boolean): void {
  writeEnabled(enabled);
  if (enabled) {
    devServerReachable = true;
    console.log('[logger] logging enabled');
  } else {
    console.log('[logger] logging disabled');
    if (postTimer !== null) {
      clearTimeout(postTimer);
      postTimer = null;
    }
  }
}

/**
 * Returns whether logging is currently active.
 *
 * @tag utils.logger.is-enabled - Check Log State (ARCHITECTURE.md)
 */
export function isLoggingEnabled(): boolean {
  return isEnabled();
}

// ─── Window globals ─────────────────────────────────────────────────

declare global {
  interface Window {
    __tripMapperLog?: (enabled: boolean) => void;
    __tripMapperLogStatus?: () => boolean;
  }
}

function installGlobals(): void {
  if (typeof window === 'undefined') return;

  window.__tripMapperLog = (enabled: boolean) => {
    setLoggingEnabled(enabled);
  };

  window.__tripMapperLogStatus = () => {
    return isLoggingEnabled();
  };
}

installGlobals();
