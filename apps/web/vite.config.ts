import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    hmr: {
      overlay: false,
      clientPort: 443,
    },
    allowedHosts: [
      "9dc2f6f9-a38c-4bbd-b603-2d745b10236b-00-280e8823h1ybz.janeway.replit.dev",
      "localhost",
      "127.0.0.1",
      "0.0.0.0"
    ],
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 5000,
    host: "0.0.0.0",
  }
});