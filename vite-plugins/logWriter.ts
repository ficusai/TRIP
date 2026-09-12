// TAG: build.log-writer - Vite Log Writer Plugin (ARCHITECTURE.md)

// Import Node's filesystem API so the plugin can create and write log files.
import fs from 'node:fs';
// Import Node's path helpers so log locations work across operating systems.
import path from 'node:path';
// Import Vite's Plugin type so this factory returns a correctly shaped plugin object.
import type { Plugin } from 'vite';

/**
 * Creates the Vite plugin that stores browser log lines in a local text file.
 * The returned plugin adds development-server routes and lifecycle hooks.
 *
 * The server-side toggle only controls this plugin's file writer. The browser
 * logger has a separate localStorage preference.
 *
 * The logging service can be toggled at runtime:
 *   - GET  /__log/status  → { enabled: boolean }
 *   - POST /__log/toggle   → flips this plugin's enabled state
 *   - POST /__log          → accepts a JSON array of log lines (503 when disabled)
 *
 * Session files are created as: logs/session-YYYY-MM-DDTHH-MM-SS.txt
 *
 * @tag build.log-writer.plugin - Log Writer Vite Plugin (ARCHITECTURE.md)
 */
export function logWriterPlugin(): Plugin {
  // Resolve the logs directory from the process's current working directory.
  // Run Vite from the project root so this points to TRIP/logs.
  const logsDir = path.resolve(process.cwd(), 'logs');
  // Holds the current session filename after openSession assigns it.
  let sessionFile = '';
  // The server-side writer starts enabled; POST /__log/toggle flips this value.
  let enabled = true;
  // Holds the open file stream, or null before a session starts and after it closes.
  let stream: fs.WriteStream | null = null;

  // Create a new timestamped session file and remember its write stream.
  function openSession(): void {
    try {
      // Create logs/ when it does not exist; recursive mode also tolerates missing parents.
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Make a filesystem-safe timestamp by replacing colons and dots with hyphens.
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      // Combine the directory and filename without relying on a platform-specific separator.
      sessionFile = path.join(logsDir, `session-${stamp}.txt`);

      // Open the file in append mode ('a'), preserving an existing file if the name repeats.
      stream = fs.createWriteStream(sessionFile, { flags: 'a' });

      // Build a readable header containing the app name, start time, and exact file path.
      const header = [
        '═══════════════════════════════════════════════════════════',
        `  Trip Mapper v1.0 — Session Log`,
        `  Started: ${new Date().toISOString()}`,
        `  File:    ${sessionFile}`,
        '═══════════════════════════════════════════════════════════',
        '',
      ].join('\n');

      // Write the header before any browser log lines arrive.
      stream.write(header);
      console.log(`[log-writer] session started → ${sessionFile}`);
    } catch (err) {
      // Keep the dev server running if disk creation or stream opening fails.
      console.error('[log-writer] failed to open session:', err);
    }
  }

  // Finish the current session by writing a footer and closing its file stream.
  function closeSession(): void {
    try {
      // A null stream means there is no active session to close.
      if (stream) {
        // Add a final timestamped footer so the file has a clear endpoint.
        const footer = [
          '',
          '═══════════════════════════════════════════════════════════',
          `  Session ended: ${new Date().toISOString()}`,
          '═══════════════════════════════════════════════════════════',
        ].join('\n');

        stream.write(footer);
        // Signal that no more data will be written and release the file handle.
        stream.end();
        stream = null;
        console.log(`[log-writer] session closed → ${sessionFile}`);
      }
    } catch (err) {
      // Report a close failure without allowing it to crash Vite.
      console.error('[log-writer] failed to close session:', err);
    }
  }

  // Return the Vite plugin object; Vite calls its hooks at defined lifecycle moments.
  return {
    // Identify this plugin in Vite output and diagnostics.
    name: 'trip-mapper-log-writer',

    // Configure development-server middleware after Vite creates its HTTP server.
    configureServer(server) {
      // Register GET /__log/status; the request argument is unused because only the response matters.
      server.middlewares.use('/__log/status', (_req, res) => {
        try {
          // Tell the browser to interpret the response as JSON text.
          res.setHeader('Content-Type', 'application/json');
          // Return the current server-side enabled value as { "enabled": true/false }.
          res.end(JSON.stringify({ enabled }));
        } catch (err) {
          console.error('[log-writer] /__log/status error:', err);
        }
      });

      // Register POST /__log/toggle for flipping the server-side file writer.
      server.middlewares.use('/__log/toggle', (_req, res) => {
        try {
          // Only POST may change state; other methods receive HTTP 405 Method Not Allowed.
          if (_req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'POST required' }));
            return;
          }

          // Invert the current boolean: true becomes false, and false becomes true.
          enabled = !enabled;
          const msg = enabled ? 'enabled' : 'disabled';
          console.log(`[log-writer] logging ${msg}`);

          // When enabling, create a session file if one is not already open.
          if (enabled && !stream) {
            openSession();
          }

          // Return the new server-side state as JSON.
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ enabled }));
        } catch (err) {
          console.error('[log-writer] /__log/toggle error:', err);
        }
      });

      // Register POST /__log for batches of formatted browser log lines.
      server.middlewares.use('/__log', (req, res) => {
        try {
          // Reject GET or any non-POST request with HTTP 405.
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'POST required' }));
            return;
          }

          // When the server-side writer is disabled, return HTTP 503 Service Unavailable.
          if (!enabled) {
            res.statusCode = 503;
            res.end(JSON.stringify({ enabled: false }));
            return;
          }

          // Collect the request body chunks as text until the client finishes sending.
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });

          // Parse and write the complete body only after the request emits its end event.
          req.on('end', () => {
            try {
              // The browser sends a JSON array; invalid JSON throws and is handled below.
              const lines: string[] = JSON.parse(body);

              // Open a session file on demand if no stream is currently active.
              if (!stream) {
                openSession();
              }

              // Write each log line followed by a newline so records remain separate.
              for (const line of lines) {
                stream!.write(line + '\n');
              }

              // HTTP 204 means the batch was accepted and there is no response body.
              res.statusCode = 204;
              res.end();
            } catch (err) {
              // Parsing or disk-write failures become HTTP 500 Internal Server Error.
              console.error('[log-writer] failed to write log line:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'write failed' }));
            }
          });
        } catch (err) {
          console.error('[log-writer] /__log error:', err);
        }
      });
    },

    // Run when Vite starts a build; this plugin only logs initialization here.
    buildStart() {
      try {
        console.log('[log-writer] plugin initialized');
      } catch (err) {
        console.error('[log-writer] buildStart error:', err);
      }
    },

    // Run after a build finishes, whether it succeeded or failed.
    buildEnd() {
      try {
        closeSession();
      } catch (err) {
        console.error('[log-writer] buildEnd error:', err);
      }
    },

    // Run when Vite closes its bundle/server resources.
    closeBundle() {
      try {
        closeSession();
      } catch (err) {
        console.error('[log-writer] closeBundle error:', err);
      }
    },
  };
}
