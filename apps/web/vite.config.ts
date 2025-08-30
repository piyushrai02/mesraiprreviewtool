import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: "0.0.0.0",
    hmr: {
      port: 443,
      clientPort: 443,
    },
    allowedHosts: 'all',
    strictPort: false,
  },
  preview: {
    port: 5000,
    host: "0.0.0.0",
  },
});
