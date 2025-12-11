import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    // Only use proxy in development
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    } : undefined,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable source maps for production
    minify: 'esbuild',  // Use esbuild for fast minification (built into Vite)
  },
})
