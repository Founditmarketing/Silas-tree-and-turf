import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
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
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          gallery: path.resolve(__dirname, 'gallery.html'),
          process: path.resolve(__dirname, 'process.html'),
          beautification: path.resolve(__dirname, 'service-beautification.html'),
          emergency: path.resolve(__dirname, 'service-emergency.html'),
          fertilization: path.resolve(__dirname, 'service-fertilization.html'),
          stumpGrinding: path.resolve(__dirname, 'service-stump-grinding.html'),
          treeRemoval: path.resolve(__dirname, 'service-tree-removal.html'),
          treeTrimming: path.resolve(__dirname, 'service-tree-trimming.html'),
        },
      },
    },
  };
});
