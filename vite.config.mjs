import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'auto-redirect-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanUrl = req.url.split('?')[0].split('#')[0];
          if (cleanUrl === '/odontocloud-react') {
            const query = req.url.slice(cleanUrl.length);
            res.writeHead(301, { Location: `/odontocloud-react/${query}` });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  base: '/odontocloud-react/',
  server: {
    port: 3000,
    strictPort: true,
    open: '/odontocloud-react/',
  },
  optimizeDeps: {
    entries: ['./index.html'],
  },
})
