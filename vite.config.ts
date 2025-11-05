import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carrega variáveis de ambiente para garantir que o Vite as reconheça
    // e as injete como import.meta.env.VITE_...
    loadEnv(mode, '.', ''); 
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Removendo 'define' para GEMINI_API_KEY, pois não é mais necessário
      // se o código estiver usando import.meta.env.VITE_...
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});