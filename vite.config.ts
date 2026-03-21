import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/picsum\.photos\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'picsum-images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          id: '/',
          name: 'SGS Coaching',
          short_name: 'SGS Coaching',
          description: 'SGS School Management and Learning App',
          theme_color: '#0021ff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjqBtUkq3GaWuBFlHDa9tXyVPjdOtjFFJQJxBtlR55lER7dnGHhkrDXgByZs5x990inb5w_FMhxQnewWBI6Zw3doN9Fzy7wKGR-NF-AA8qyakolVWrwjpvmJaktjiyK_OJTGX4HDBlooulzV6o0Wz1kBAYwnxzHCAdE5Gxp6tSJr1RNE5kzWGXy0Ho-gFs/s1600/SGS%20App%20Logo-modified.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjqBtUkq3GaWuBFlHDa9tXyVPjdOtjFFJQJxBtlR55lER7dnGHhkrDXgByZs5x990inb5w_FMhxQnewWBI6Zw3doN9Fzy7wKGR-NF-AA8qyakolVWrwjpvmJaktjiyK_OJTGX4HDBlooulzV6o0Wz1kBAYwnxzHCAdE5Gxp6tSJr1RNE5kzWGXy0Ho-gFs/s1600/SGS%20App%20Logo-modified.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjqBtUkq3GaWuBFlHDa9tXyVPjdOtjFFJQJxBtlR55lER7dnGHhkrDXgByZs5x990inb5w_FMhxQnewWBI6Zw3doN9Fzy7wKGR-NF-AA8qyakolVWrwjpvmJaktjiyK_OJTGX4HDBlooulzV6o0Wz1kBAYwnxzHCAdE5Gxp6tSJr1RNE5kzWGXy0Ho-gFs/s1600/SGS%20App%20Logo-modified.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
