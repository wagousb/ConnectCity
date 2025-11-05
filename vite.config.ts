import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    // Carrega variáveis de ambiente para garantir que o Vite as reconheça
    // e as injete como import.meta.env.VITE_...
    loadEnv(mode, '.', ''); 
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
          },
          manifest: {
            name: 'Itamorotinga',
            short_name: 'Itamorotinga',
            description: 'Sua voz, o futuro da nossa cidade.',
            theme_color: '#4f46e5',
            background_color: '#f8fafc',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/logo-app.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/logo-app.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: '/logo-app.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});