import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
