import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Project Pages path for the dkzi78/simon- repository (ADR-6).
const PAGES_BASE = '/simon-/';

export default defineConfig(({ command, isPreview }) => ({
  // Dev stays at '/'; build and preview use the same path as the live site.
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [
    VitePWA({
      // Lifecycle only: a new version waits; no reload and no update UI (ARCHITECTURE §6).
      registerType: 'prompt',
      injectRegister: 'script',
      devOptions: { enabled: false },
      // workbox.globPatterns already precaches the icons; the plugin adds the manifest.
      includeManifestIcons: false,
      manifest: {
        id: PAGES_BASE,
        name: 'סיימון',
        short_name: 'סיימון',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        start_url: `${PAGES_BASE}#/`,
        scope: PAGES_BASE,
        background_color: '#070F1C',
        theme_color: '#0D1A2C',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'simon-',
        globPatterns: ['**/*.{html,js,css,svg,png,ico,woff2}'],
        skipWaiting: false,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
