import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // WHY: host 0.0.0.0 allows connections from outside the container.
    // Without this, Vite only accepts connections from localhost
    // inside the container — your browser can never reach it.
    host: "0.0.0.0",
    port: 5173,

    // WHY: Polling is needed for file watching inside Docker on Windows.
    // Docker on Windows uses volume mounts — the normal file system
    // events don't work. Polling checks for changes every 1 second.
    watch: {
      usePolling: true,
      interval: 1000,
    }
  }
})