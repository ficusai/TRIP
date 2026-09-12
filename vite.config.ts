// TAG: build.vite-config - Vite Build Configuration (ARCHITECTURE.md)

// Import Vite's helper that validates and normalizes a configuration object.
import { defineConfig } from 'vite';
// Import the official React plugin so Vite understands JSX and Fast Refresh.
import react from '@vitejs/plugin-react';
// Import Tailwind CSS v4's Vite integration for generating utility styles.
import tailwindcss from '@tailwindcss/vite';
// Import the project plugin that writes browser logs to session files.
import { logWriterPlugin } from './vite-plugins/logWriter';

// Hold the configuration while it is created; TypeScript infers its type from defineConfig.
let config;
try {
  // Build one configuration object from three plugins and server/build options.
  config = defineConfig({
    // Run React support first, then Tailwind processing, then the log writer.
    plugins: [react(), tailwindcss(), logWriterPlugin()],
    server: {
      // Use port 3001, matching package.json and the project documentation.
      port: 3001,
      // Bind to all network interfaces, not only localhost, for LAN testing.
      host: true,
    },
    build: {
      // Write the production bundle to the dist directory.
      outDir: 'dist',
      // Do not emit source-map files; this keeps the production output smaller.
      sourcemap: false,
    },
  });
} catch (err) {
  // Configuration errors are rare, but report them before rethrowing.
  console.error('Failed to initialize vite config:', err);
  throw err;
}

// Export the configuration so Vite can load it as the default config module.
export default config;
