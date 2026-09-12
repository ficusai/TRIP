// TAG: utils.logger - Centralized Structured Logger (ARCHITECTURE.md)

/**
 * Centralized structured logger for trip-mapper v1.0.
 *
 * All log output for every function must go through this module.
 * Provides stage-detection logging: entry, step, exit, and error paths.
 *
 * ## Service on/off control
 *
 * Logging can be controlled at three levels:
 *   1. **Build-time**: `VITE_LOGGING_ENABLED=false` makes this module ignore normal log writes.
 *   2. **Runtime (localStorage)**: Key `trip-mapper-logging` stores the string `"true"` or `"false"`.
 *   3. **Runtime (programmatic)**: `setLoggingEnabled(...)` changes the stored value for this browser page.
 *
 * The separate Vite plugin implements the HTTP endpoints `GET /__log/status` and `POST /__log/toggle`.
 * Normal log writes are skipped when logging is off; the explicit toggle function still prints a status message.
 *
 * ## Session files
 *
 * During development, the Vite log-writer plugin (`vite-plugins/logWriter.ts`)
 * receives log lines via HTTP POST at `/__log` and writes them to:
 *   `logs/session-YYYY-MM-DDTHH-MM-SS.txt`
 *
 * @tag utils.logger - Centralized Structured Logger (ARCHITECTURE.md)
 */

// LogLevel is a closed set of labels: trace is the most detailed and error is the most severe.
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// Give each level a number so the logger can compare severity consistently.
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

// The current minimum is trace, so every supported level is allowed to pass the filter.
const MIN_LEVEL: LogLevel = 'trace';

// This exact localStorage key stores the browser's logging preference.
const STORAGE_KEY = 'trip-mapper-logging';
// Vite replaces import.meta.env at build time; only the exact string "false" disables normal writes.
const BUILD_ENABLED = import.meta.env?.VITE_LOGGING_ENABLED !== 'false';

// sessionLines temporarily holds formatted log lines before they are sent to the dev server.
const sessionLines: string[] = [];

// postTimer is null when no delayed send is waiting; otherwise it identifies that timer.
let postTimer: ReturnType<typeof setTimeout> | null = null;
// devServerReachable remembers whether the last attempted dev-server POST failed.
let devServerReachable = true;

// Service on/off

// Read the stored preference and turn it into a true/false value.
function readEnabled(): boolean {
  // A build-time value of false is a hard stop, even if localStorage says otherwise.
  if (!BUILD_ENABLED) return false;
  try {
    // The stored value is text, so only the exact string "false" means disabled.
    // Missing, "true", or any other value means enabled.
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    // If browser storage cannot be read, keep logging available instead of crashing.
    return true;
  }
}

// Save a true/false preference as the strings "true" or "false".
function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage can be full or blocked; the page should continue working without this preference.
    /* localStorage full or unavailable — ignore */
  }
}

// Expose the preference check under a short name for the rest of this module.
function isEnabled(): boolean {
  return readEnabled();
}

// Formatting

// Create an ISO 8601 timestamp so each log line has a sortable universal time.
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Turn structured log fields into one readable text line for console and file output.
function formatLine(level: LogLevel, context: string, stage: string, message: string, data?: unknown): string {
  // Put time, level, module, and lifecycle stage in a consistent bracketed prefix.
  const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}] [${context}] [${stage}]`;

  // Start with no extra data; optional data will be appended only when supplied.
  let suffix = '';
  if (data !== undefined) {
    try {
      // JSON makes objects and arrays easy to search in a text log.
      suffix = ` ${JSON.stringify(data)}`;
    } catch {
      // Circular or unusual values cannot become JSON, so preserve a safe text representation.
      suffix = ` [unserializable: ${String(data)}]`;
    }
  }

  // Combine the fixed prefix, human message, and optional data into the final line.
  return `${prefix} ${message}${suffix}`;
}

// Transport: console

// Choose which browser console method matches the severity of a log line.
function writeConsole(level: LogLevel, line: string): void {
  try {
    switch (level) {
      // Errors use the console's error channel, which browsers often highlight.
      case 'error':
        console.error(line);
        break;
      // Warnings use the warning channel while remaining less severe than errors.
      case 'warn':
        console.warn(line);
        break;
      // trace, debug, and info all use the normal log channel.
      default:
        console.log(line);
    }
  } catch (err) {
    // A blocked or broken console must not break application code.
    // Ignore console errors
  }
}

// Send all currently buffered lines to the Vite dev-server log endpoint.
function flushToServer(): void {
  try {
    // There is nothing to send when the buffer is empty.
    if (sessionLines.length === 0) return;
    // Skip network work after a previous failure until logging is enabled again.
    if (!devServerReachable) return;

    // Remove every line from the buffer and keep that removed batch in `batch`.
    // `splice(0)` mutates the array; it does not make a copy.
    const batch = sessionLines.splice(0);
    
    let body: string;
    try {
      // The server expects one JSON array containing the batch of text lines.
      body = JSON.stringify(batch);
    } catch {
      // This fallback is defensive; formatted lines are strings and normally serialize safely.
      body = "[]";
    }

    // POST the batch to the development-only endpoint with a JSON content type.
    fetch('/__log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).catch(() => {
      // A network failure means the dev server cannot currently receive logs.
      devServerReachable = false;
      // Put the unsent batch back at the front so it can be retried later.
      // Logs already in sessionLines were spliced — re-add to buffer
      // so they aren't lost if the server comes back.
      sessionLines.unshift(...batch);
    });
  } catch (err) {
    // Unexpected synchronous failures are reported without stopping the app.
    console.error('logger flushToServer failed', err);
  }
}

// Schedule one delayed server send for a group of newly buffered log lines.
function scheduleFlush(): void {
  try {
    // If a timer already exists, do not create a duplicate send for the same batch.
    if (postTimer !== null) return;
    // Wait 200 milliseconds so nearby log calls can be sent together.
    postTimer = setTimeout(() => {
      try {
        // Clear the reference before sending so a new batch can schedule another timer.
        postTimer = null;
        flushToServer();
      } catch (err) {
        console.error('logger scheduleFlush timeout failed', err);
      }
    }, 200);
  } catch (err) {
    console.error('logger scheduleFlush failed', err);
  }
}

// Add one formatted line to the buffer and arrange for it to be sent soon.
function bufferLine(line: string): void {
  try {
    sessionLines.push(line);
    scheduleFlush();
  } catch (err) {
    console.error('logger bufferLine failed', err);
  }
}

// Write one log record through the enabled and severity checks, then to both transports.
function write(level: LogLevel, context: string, stage: string, message: string, data?: unknown): void {
  try {
    // Do no console or network work when the runtime preference disables logging.
    if (!isEnabled()) return;
    // Do no work when this level is below the configured minimum severity.
    if (!shouldLog(level)) return;

    // Build the timestamped, labeled text line from the supplied fields.
    const line = formatLine(level, context, stage, message, data);

    // Show the line in the browser console immediately.
    writeConsole(level, line);
    // Also queue it for the dev-server session file.
    bufferLine(line);
  } catch (err) {
    console.error('logger write failed', err);
  }
}

// Compare a requested level with the configured minimum level.
function shouldLog(level: LogLevel): boolean {
  try {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
  } catch {
    // If an unexpected level slips through, allow it rather than dropping the record.
    return true;
  }
}

// Public API

/**
 * Creates a logger that adds the same context label to every record it writes.
 * The returned methods cover the lifecycle stages used throughout TRIP.
 *
 * @tag utils.logger.create - Logger Factory (ARCHITECTURE.md)
 * @param context - The function or module name this logger is bound to
 * @returns An object with entry, step, exit, error, warn, and info methods
 */
export function createLogger(context: string) {
  return {
    // Record that a function or module has started; params are optional extra details.
    entry(params?: unknown): void {
      write('debug', context, 'entry', 'function entered', params);
    },

    // Record a named point inside the function; data is optional structured detail.
    step(name: string, data?: unknown): void {
      write('trace', context, 'step', name, data);
    },

    // Record successful completion and optionally include the returned result.
    exit(result?: unknown): void {
      write('debug', context, 'exit', 'function exited', result);
    },

    // Convert an Error or other thrown value into a readable error record.
    error(err: unknown, stage?: string): void {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      write('error', context, stage ?? 'error', message, stack ? { stack } : undefined);
    },

    // Record a warning that does not necessarily stop the application.
    warn(message: string, data?: unknown): void {
      write('warn', context, 'warn', message, data);
    },

    // Record general information at a level between debug and warning.
    info(message: string, data?: unknown): void {
      write('info', context, 'info', message, data);
    },
  };
}

// Runtime toggle API

/**
 * Turn logging on or off for this browser page.
 * The preference is stored as text in localStorage and survives reloads.
 * `enabled` must be a boolean: `true` enables normal log writes and `false`
 * disables them and cancels a pending server-send timer.
 *
 * @tag utils.logger.toggle - Runtime Log Toggle (ARCHITECTURE.md)
 * @param enabled - `true` to turn logging on, `false` to turn it off
 */
export function setLoggingEnabled(enabled: boolean): void {
  // Save the requested preference before changing in-memory retry state.
  writeEnabled(enabled);
  if (enabled) {
    // A newly enabled logger may try the dev-server endpoint again.
    devServerReachable = true;
    // This explicit status message is printed even though normal log writes are disabled.
    console.log('[logger] logging enabled');
  } else {
    // This explicit status message tells the developer that logging was turned off.
    console.log('[logger] logging disabled');
    if (postTimer !== null) {
      // Prevent a queued batch from being sent after the user disabled logging.
      clearTimeout(postTimer);
      postTimer = null;
    }
  }
}

/**
 * Return the current browser-side logging state.
 * The result is `true` when build-time logging is allowed and localStorage
 * does not contain the exact string `"false"`.
 *
 * @tag utils.logger.is-enabled - Check Log State (ARCHITECTURE.md)
 */
export function isLoggingEnabled(): boolean {
  return isEnabled();
}

// Tell TypeScript that the browser's Window object has two optional TRIP controls.
// These declarations add types only; the functions below install the actual values.
declare global {
  interface Window {
    // Console callers can pass true or false to change the browser logging preference.
    __tripMapperLog?: (enabled: boolean) => void;
    // Console callers can read the current browser logging preference as a boolean.
    __tripMapperLogStatus?: () => boolean;
  }
}

// Install optional console controls when this module runs in a browser.
function installGlobals(): void {
  try {
    // Node or another non-browser environment has no Window object, so do nothing there.
    if (typeof window === 'undefined') return;

    // Accept only a boolean toggle value and delegate to the persistent preference function.
    window.__tripMapperLog = (enabled: boolean) => {
      try {
        setLoggingEnabled(enabled);
      } catch (err) {
        console.error('window.__tripMapperLog failed', err);
      }
    };

    // Return the current browser-side state, or false if checking it unexpectedly fails.
    window.__tripMapperLogStatus = () => {
      try {
        return isLoggingEnabled();
      } catch (err) {
        console.error('window.__tripMapperLogStatus failed', err);
        return false;
      }
    };
  } catch (err) {
    // Installation is optional infrastructure; a failure must not stop the app.
    console.error('installGlobals failed', err);
  }
}

// Run the browser-control installation automatically when the logger module loads.
installGlobals();
