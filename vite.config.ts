// TAG: build.vite-config - Vite Build Configuration (ARCHITECTURE.md)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { logWriterPlugin } from './vite-plugins/logWriter';

let config;
try {
  config = defineConfig({
    plugins: [react(), tailwindcss(), logWriterPlugin()],
    server: {
      port: 3001,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  });
} catch (err) {
  console.error('Failed to initialize vite config:', err);
  throw err;
}

export default config;
