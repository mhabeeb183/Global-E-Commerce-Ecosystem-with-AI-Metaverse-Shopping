import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const pathTraversalShield = () => ({
  name: "path-traversal-shield",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        
        // 1. Validate the 'v' query parameter (dependency version hash)
        const v = url.searchParams.get("v");
        if (v) {
          const decodedV = decodeURIComponent(v);
          // Only allow alphanumeric characters, hyphens, and underscores
          if (!/^[a-zA-Z0-9-_]+$/.test(decodedV)) {
            res.statusCode = 400;
            res.end("Bad Request: Invalid parameter format.");
            return;
          }
        }

        // 2. Generic query parameter safety check for command injection characters
        for (const [key, value] of url.searchParams.entries()) {
          const decodedValue = decodeURIComponent(value);
          if (/[;&|`$"']/g.test(decodedValue)) {
            res.statusCode = 400;
            res.end("Bad Request: Invalid parameter format.");
            return;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      next();
    });
  }
});

const securityHeadersMiddleware = () => ({
  name: "security-headers-middleware",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      try {
        const host = req.headers.host || "localhost:5173";
        const hostname = host.split(":")[0];
        const backendUrl = `http://${hostname}:5000`;
        const wsBackendUrl = `ws://${hostname}:5000`;

        const csp = `default-src 'self' ${backendUrl} https://checkout.razorpay.com; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://checkout.razorpay.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://placehold.co https://via.placeholder.com https://modelviewer.dev https://api.qrserver.com; connect-src 'self' blob: ${backendUrl} ${wsBackendUrl} https://api.razorpay.com https://modelviewer.dev https://res.cloudinary.com; frame-src 'self' https://api.razorpay.com; font-src 'self' data:; frame-ancestors 'self'; form-action 'self';`;

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      } catch (e) {
        // Ignore header errors
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), pathTraversalShield(), securityHeadersMiddleware()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 4173,
    headers: {
      "Content-Security-Policy": "default-src 'self' http://localhost:5000 https://checkout.razorpay.com; script-src 'self' 'wasm-unsafe-eval' https://checkout.razorpay.com; worker-src 'self' blob:; style-src 'self'; img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://placehold.co https://via.placeholder.com https://modelviewer.dev https://api.qrserver.com; connect-src 'self' blob: http://localhost:5000 ws://localhost:5000 https://api.razorpay.com https://modelviewer.dev https://res.cloudinary.com; frame-src 'self' https://api.razorpay.com; font-src 'self' data:; frame-ancestors 'self'; form-action 'self';",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  }
});