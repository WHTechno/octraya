import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 443, // Important for Codespaces
      protocol: 'wss'
    }
  }
})