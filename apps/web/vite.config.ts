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
    allowedHosts: [
      "9dc2f6f9-a38c-4bbd-b603-2d745b10236b-00-280e8823h1ybz.janeway.replit.dev",
    ],
    strictPort: false,
  },
  preview: {
    port: 5000,
    host: "0.0.0.0",
  },
});
