import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  server: {
    watch: {
      usePolling: true, // Enable polling for file changes
    },
  },
})