import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), TanStackRouterVite()],
    server: { port: 4534 },
    base: env.VITE_BASE_PATH,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
