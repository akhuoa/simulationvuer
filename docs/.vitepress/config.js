import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import libopencor from '../../vite-plugin-libopencor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionNumber = process.env.npm_package_version;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'SimulationVuer',
  description: 'API documentation for SimulationVuer',
  base: '/simulationvuer/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'API Reference',
        link: '/components/SimulationVuer',
      },
    ],

    sidebar: [
      {
        text: 'API Reference',
        link: '/components/SimulationVuer',
      },
      {
        text: 'Live demo for a SPARC simulation-based dataset',
        link: '/demoSparcSimulationBasedDataset',
      },
      {
        text: 'Live demo for a PMR path to an OMEX file',
        link: '/demoPmrPathToAnOmexFile',
      },
      {
        text: 'Live demo for a direct URL to an OMEX file',
        link: '/demoDirectUrlToAnOmexFile',
      },
      {
        text: 'Version',
        items: [
          {
            text: `${versionNumber}`,
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ABI-Software/simulationvuer',
      },
    ],
  },
  markdown: { attrs: { disable: true } },
  vite: {
    // Load the .env files (e.g., VITE_API_LOCATION for the demos) from the project root, like the app does, rather than
    // from VitePress' root (i.e., docs).

    envDir: path.resolve(__dirname, '../..'),

    // Some dependencies (e.g., has-hover, used by Plotly.js through PlotVuer) reference Node's `global`,
    // which doesn't exist in browsers.
    // Note: VitePress runs on Vite 5, whose `define` doesn't reach pre-bundled dependencies in dev,
    // so it is also passed to esbuild through `optimizeDeps`.

    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '../src/assets/styles' as *;`,
        },
      },
    },
    plugins: [
      Components({
        // Allow auto load markdown components under `./src/components/`.
        extensions: ['vue'],
        // Allow auto import and register the components used in markdown.
        include: [/\.vue$/, /\.vue\?vue/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'css',
          }),
        ],
      }),
      libopencor(),
      {
        name: 'cross-origin-isolation',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            next();
          });
        },
      },
    ],
  },
});
