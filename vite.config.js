import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['icons/valdria-mark.svg'],
      manifest: {
        name: 'Reinos de Valdria',
        short_name: 'Valdria',
        description: 'RPG original de exploração, Guardiões e evolução de aldeias.',
        theme_color: '#17251d',
        background_color: '#0a100d',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: './',
        icons: [
          {
            src: './icons/valdria-mark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        game: path.resolve(projectPath, 'index.html'),
        foundation: path.resolve(projectPath, 'modern.html'),
      },
    },
  },
});
