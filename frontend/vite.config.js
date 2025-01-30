import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/static',
  build: {
    outDir: '../core/static/react',  // Output directory for Django
    emptyOutDir: true,              // Clear the output directory before building
  }
})
