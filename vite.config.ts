import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      publicDir: 'public',
      server: {
        port: 3119,
        host: '0.0.0.0',
        strictPort: true,
        allowedHosts: [
          'agent.matrixlab.work',
          '.matrixlab.work'
        ],
        hmr: {
          clientPort: 443,
          protocol: 'wss'
        }
      },
      preview: {
        port: 3119,
        host: '0.0.0.0',
        strictPort: true
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        target: 'es2020',
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
              'icons': ['lucide-react']
            }
          }
        }
      }
    };
});
