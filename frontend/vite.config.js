import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig(({ command }) => {
  const commonConfig = {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    build: {
      rollupOptions: {
        plugins: [rollupNodePolyFill()],
      },
    },
  };

  if (command === 'serve') {
    // Development settings
    return {
      ...commonConfig,
      base: '/',
      server: {
        proxy: {
          '/api': 'http://localhost:8000',
        },
      },
    };
  } else {
    // Production build settings
    return {
      ...commonConfig,
      build: {
        ...commonConfig.build,
        outDir: 'dist',
        emptyOutDir: true,
        minify: false,
      },
    };
  }
});

// export default defineConfig({
//   plugins: [react()],
//   base: '/static',
//   build: {
//     outDir: '../core/static/react',  // Output directory for Django
//     emptyOutDir: true,              // Clear the output directory before building
//   }
// })
