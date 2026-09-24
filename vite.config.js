import vue from '@vitejs/plugin-vue';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

import libopencor from './vite-plugin-libopencor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathSrc = path.resolve(__dirname, './src');

export default defineConfig(({ command, mode }) => {
  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use '@/assets/styles' as *;`,
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        // Allow auto load markdown components under `./src/components/`.
        extensions: ['vue', 'md'],
        // Allow auto import and register components used in markdown.
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: 'src/components.d.ts',
      }),

      libopencor(),
    ],
    base: mode === 'app' ? './' : '/',
    build:
      mode === 'app'
        ? {}
        : {
            lib: {
              entry: path.resolve(__dirname, './src/components/index.js'),
              name: 'SimulationVuer',
              fileName: 'simulationvuer',
            },
            rollupOptions: {
              external: ['vue', '@abi-software/plotvuer', '@abi-software/plotvuer/dist/style.css'],
              output: {
                globals: {
                  vue: 'Vue',
                  '@abi-software/plotvuer': '@abi-software/plotvuer',
                },
                // keep css output name stable for the "./dist/style.css" export/import paths
                assetFileNames: (assetInfo) =>
                  assetInfo.name?.endsWith('.css') ? 'style.css' : 'assets/[name][extname]',
              },
            },
          },
    resolve: {
      alias: {
        '@': pathSrc,
        '~/': `${pathSrc}/`,
      },
    },
  };

  if (command === 'serve') {
    config.server = {
      port: 8081,

      // Emscripten pthreads require SharedArrayBuffer, which needs cross-origin isolation.

      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    };
    config.define = {
      'process.env.HTTP_PROXY': 8081,
      global: 'globalThis',
    };
  } else if (mode === 'app') {
    // Some dependencies (e.g., has-hover, used by Plotly.js through PlotVuer) reference Node's `global`,
    // which doesn't exist in browsers. (In lib mode, it's up to the consumer's bundler.)
    config.define = {
      global: 'globalThis',
    };
  }

  return config;
});
