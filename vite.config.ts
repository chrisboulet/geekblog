/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Pour résoudre les alias si besoin plus tard

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Exemple d'alias, utile pour les grands projets
      // "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    port: 5173, // Port par défaut de Vite, peut être changé
    strictPort: true, // Empêche Vite de choisir un autre port s'il est occupé
    host: '0.0.0.0', // Allow external connections
  }
})
