import vue from "@vitejs/plugin-vue";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathSrc = path.resolve(__dirname, "./src");

export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [
      vue(),
      Components({
        // Allow auto load markdown components under `./src/components/`.
        extensions: ["vue", "md"],
        // Allow auto import and register components used in markdown.
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
        dts: "src/components.d.ts",
      }),

      // Serve the local libopencor/ directory from @opencor/opencor so that the dynamic import in opencor.es.js (new
      // URL("./libopencor/wasm/...", window.location.href)) resolves same-origin. libopencor.js itself is bundled in
      // the package while the threaded WASM is loaded from opencor.ws via locateFile.

      {
        name: "opencor-serve-local-libopencor",
        configureServer(server) {
          const libopencorDir = path.resolve(
            __dirname,
            "node_modules/@opencor/opencor/dist/libopencor",
          );

          server.middlewares.use((req, res, next) => {
            const urlPath = req.url;

            if (urlPath.startsWith("/libopencor/")) {
              const filePath = path.join(
                libopencorDir,
                urlPath.replace("/libopencor/", ""),
              );

              if (fs.existsSync(filePath)) {
                res.writeHead(200, {
                  "Content-Type": "application/javascript",
                  "Cross-Origin-Embedder-Policy": "require-corp",
                  "Cross-Origin-Resource-Policy": "same-origin",
                });
                res.end(fs.readFileSync(filePath));

                return;
              }
            }

            next();
          });
        },
      },
    ],
    base: mode === "app" ? "./" : "/",
    build:
      mode === "app"
        ? {}
        : {
            lib: {
              entry: path.resolve(__dirname, "./src/components/index.js"),
              name: "SimulationVuer",
              fileName: "simulationvuer",
            },
            rollupOptions: {
              external: [
                "vue",
                "@abi-software/svg-sprite",
                "@abi-software/plotvuer",
              ],
              output: {
                globals: {
                  vue: "Vue",
                  "@abi-software/svg-sprite": "@abi-software/svg-sprite",
                  "@abi-software/plotvuer": "@abi-software/plotvuer",
                },
              },
            },
          },
    resolve: {
      alias: {
        "~/": `${pathSrc}/`,
      },
    },
  };

  if (command === "serve") {
    config.server = {
      port: 8081,

      // Emscripten pthreads require SharedArrayBuffer, which needs cross-origin isolation.

      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    };
    config.define = {
      "process.env.HTTP_PROXY": 8081,
      global: "globalThis",
    };
  }

  return config;
});
