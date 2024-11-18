import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',  // Use vite-node environment
    coverage: {
      provider: 'v8',       // Use 'v8' as the coverage provider
      reporter: ['text', 'lcov'], // Generates text output and a lcov report
      reportsDirectory: 'coverage', // Output directory for coverage reports
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/normalize.js'),
      formats: ['cjs','es'],
      fileName: 'bundle',
    },
    rollupOptions: {
      external: ['node:*'],
      output: {
        dir: path.resolve(__dirname, 'dist'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
