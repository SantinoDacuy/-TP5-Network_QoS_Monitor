import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, './src/react-native-shim.ts'),
      '@core': path.resolve(__dirname, '../mobile/src/core'),
      '@engine': path.resolve(__dirname, '../mobile/src/engine'),
      '@geo': path.resolve(__dirname, '../mobile/src/geo'),
      '@storage': path.resolve(__dirname, '../mobile/src/storage'),
      '@notifications': path.resolve(__dirname, '../mobile/src/notifications'),
      '@native': path.resolve(__dirname, '../mobile/src/native'),
      '@state': path.resolve(__dirname, '../mobile/src/state')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});
