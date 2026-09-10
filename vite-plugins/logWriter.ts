// TAG: build.log-writer - Vite Log Writer Plugin (ARCHITECTURE.md)

import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Vite plugin that receives browser log lines via HTTP POST at /__log
 * and appends them to a session text file under logs/.
 *
 * The logging service can be toggled at runtime:
 *   - GET  /__log/status  → { enabled: boolean }
 *   - POST /__log/toggle   → flips the enabled state
 *   - POST /__log          → accepts log lines (returns 503 when disabled)
 *
 * Session files are created as: logs/session-YYYY-MM-DDTHH-MM-SS.txt
 *
 * @tag build.log-writer.plugin - Log Writer Vite Plugin (ARCHITECTURE.md)
 */
export function logWriterPlugin(): Plugin {
  const logsDir = path.resolve(process.cwd(), 'logs');
  let sessionFile = '';
  let enabled = true;
  let stream: fs.WriteStream | null = null;

  function openSession(): void {
    try {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      sessionFile = path.join(logsDir, `session-${stamp}.txt`);

      stream = fs.createWriteStream(sessionFile, { flags: 'a' });

      const header = [
        '═══════════════════════════════════════════════════════════',
        `  Trip Mapper v1.0 — Session Log`,
        `  Started: ${new Date().toISOString()}`,
        `  File:    ${sessionFile}`,
        '═══════════════════════════════════════════════════════════',
        '',
      ].join('\n');

      stream.write(header);
      console.log(`[log-writer] session started → ${sessionFile}`);
    } catch (err) {
      console.error('[log-writer] failed to open session:', err);
    }
  }

  function closeSession(): void {
    try {
      if (stream) {
        const footer = [
          '',
          '═══════════════════════════════════════════════════════════',
          `  Session ended: ${new Date().toISOString()}`,
          '═══════════════════════════════════════════════════════════',
        ].join('\n');

        stream.write(footer);
        stream.end();
        stream = null;
        console.log(`[log-writer] session closed → ${sessionFile}`);
      }
    } catch (err) {
      console.error('[log-writer] failed to close session:', err);
    }
  }

  return {
    name: 'trip-mapper-log-writer',

    configureServer(server) {
      server.middlewares.use('/__log/status', (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ enabled }));
        } catch (err) {
          console.error('[log-writer] /__log/status error:', err);
        }
      });

      server.middlewares.use('/__log/toggle', (_req, res) => {
        try {
          if (_req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'POST required' }));
            return;
          }

          enabled = !enabled;
          const msg = enabled ? 'enabled' : 'disabled';
          console.log(`[log-writer] logging ${msg}`);

          if (enabled && !stream) {
            openSession();
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ enabled }));
        } catch (err) {
          console.error('[log-writer] /__log/toggle error:', err);
        }
      });

      server.middlewares.use('/__log', (req, res) => {
        try {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'POST required' }));
            return;
          }

          if (!enabled) {
            res.statusCode = 503;
            res.end(JSON.stringify({ enabled: false }));
            return;
          }

          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const lines: string[] = JSON.parse(body);

              if (!stream) {
                openSession();
              }

              for (const line of lines) {
                stream!.write(line + '\n');
              }

              res.statusCode = 204;
              res.end();
            } catch (err) {
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

    buildStart() {
      try {
        console.log('[log-writer] plugin initialized');
      } catch (err) {
        console.error('[log-writer] buildStart error:', err);
      }
    },

    buildEnd() {
      try {
        closeSession();
      } catch (err) {
        console.error('[log-writer] buildEnd error:', err);
      }
    },

    closeBundle() {
      try {
        closeSession();
      } catch (err) {
        console.error('[log-writer] closeBundle error:', err);
      }
    },
  };
}
