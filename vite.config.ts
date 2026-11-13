import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { securityHeadersPlugin } from './build/security-headers.ts';

export default defineConfig(({ mode }) => {
  // VITE_API_URL quyết định connect-src của CSP (API và Socket.IO ở origin khác khi deploy).
  const apiOrigin = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL || undefined;
  return {
    plugins: [react(), tailwindcss(), securityHeadersPlugin(apiOrigin)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Dev: gọi /api cùng origin để cookie refresh token không vướng CORS.
      proxy: {
        '/api': 'http://localhost:5000',
        // Socket.IO cần proxy WebSocket.
        '/socket.io': { target: 'http://localhost:5000', ws: true },
      },
    },
  };
});
