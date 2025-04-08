import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Development settings
    return {
      plugins: [react()],
      // Use a relative base for dev
      base: '/',
      server: {
        // Proxy API calls to your Django backend running on localhost:8000
        proxy: {
          '/api': 'http://localhost:8000',
        },
      },
    }
  } else {
    // Production build settings
    return {
      plugins: [react()],
      base: '/static',
      build: {
        outDir: '../core/static/react',  // Output directory for Django
        emptyOutDir: true,              // Clear the output directory before building
        minify: false
      },
    }
  }
})

// export default defineConfig({
//   plugins: [react()],
//   base: '/static',
//   build: {
//     outDir: '../core/static/react',  // Output directory for Django
//     emptyOutDir: true,              // Clear the output directory before building
//   }
// })
