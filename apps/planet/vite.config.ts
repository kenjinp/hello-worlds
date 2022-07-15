import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const crossOriginIsolation = () => ({
  name: "configure-server",
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["react/jsx-runtime"],
  },
  plugins: [react(), crossOriginIsolation()],
});
