import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Cambiado de 3000 a 3001
    host: true   // Permite acceso desde la red local
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})