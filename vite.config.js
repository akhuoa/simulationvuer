import path from "path";
import { resolve } from "node:path";
const pathSrc = path.resolve(__dirname, "./src");
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config = {
    // css: {
    //     preprocessorOptions: {
    //       scss: {
    //         additionalData: `@use '${pathSrc}\\assets\\styles' as *;`
    //       },
    //     },
    // },
    plugins: [
        vue(),
        Components({
          // allow auto load markdown components under `./src/components/`
          extensions: ['vue', 'md'],
          // allow auto import and register components used in markdown
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          resolvers: [
            ElementPlusResolver({
              importStyle: 'sass',
            }),
          ],
          dts: 'src/components.d.ts',
        }),
    
        // https://github.com/antfu/unocss
        // see unocss.config.ts for config
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "./src/components/index.js"),
        name: "SimulationVuer",
        fileName: "simulationvuer",
      },
      rollupOptions: {
        external: ["vue", "@abi-software/svg-sprite", "@abi-software/plotvuer"],
        output: {
          globals: {
            vue: "Vue",
            "@abi-software/svg-sprite": "@abi-software/svg-sprite",
            "@abi-software/plotvuer": "@abi-software/plotvuer"
          },
        },
      }, 
    },
    resolve: {
      alias: {
        '~/': `${pathSrc}/`,
      },
    },
  };

  if (command === 'serve') {
    config.server =  {
      port: 8081,
    };
    config.define = {
      'process.env.HTTP_PROXY': 8081,
      global: 'globalThis',
      // If you want to exposes all env variables, which is not recommended
      // 'process.env': env
    };
  };
  return config;
})