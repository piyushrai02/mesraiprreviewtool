import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    hmr: {
      overlay: false,
    },
    allowedHosts: 'all',
    strictPort: false
  },
  preview: {
    port: 5000,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@mesrai/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
})
