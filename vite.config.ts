// TAG: build.vite-config - Vite Build Configuration (ARCHITECTURE.md)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { logWriterPlugin } from './vite-plugins/logWriter';

export default defineConfig({
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
