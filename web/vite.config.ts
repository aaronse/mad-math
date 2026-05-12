import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['audio/*.mp3', 'audio/*.ogg'],
      manifest: {
        name: 'Mad Math',
        short_name: 'Mad Math',
        description: 'A local-first math practice game.',
        theme_color: '#1b132a',
        background_color: '#11131d',
        display: 'standalone',
        start_url: '/',
        icons: []
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**']
  }
});