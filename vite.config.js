import vue from "@vitejs/plugin-vue";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathSrc = path.resolve(__dirname, "./src");

// Retrieve the version of libOpenCOR used by @opencor/opencor.

const opencorPackage = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "node_modules/@opencor/opencor/package.json"),
    "utf-8",
  ),
);
const libopencorVersion = opencorPackage.libopencorVersion;
const libopencorUrl =
  `https://opencor.ws/libopencor/downloads/wasm/${libopencorVersion}`;

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

      // Rewrite the libOpenCOR import URL in @opencor/opencor to a same-origin path. This is needed because
      // libopencor.js constructs pthread workers via new Worker(), which requires the worker script to be
      // same-origin with the page. The actual files are served by the dev server proxy (see below).

      {
        name: "opencor-local-libopencor",
        enforce: "pre",

        // Tell Vite that /libopencor/* paths are external.
        // Note: they are served via the dev server proxy, so Vite should not try to resolve them locally.

        resolveId(id) {
          if (id.startsWith("/libopencor/")) {
            return { id, external: true };
          }
        },

        // Rewrite the libOpenCOR URL to same-origin path for @opencor/opencor.
        // Note: this is needed so the worker constructed inside libopencor.js is same-origin (i.e. no CORS error).
        //       For production, the target server should be configured to serve /libopencor/* files.

        transform(code, id) {
          if (command !== "serve") {
            return;
          }

          if (id.includes("@opencor/opencor") && !id.split("?")[0].endsWith(".css")) {
            return {
              code: code.replace(
                /"https:\/\/opencor\.ws\/libopencor\/downloads\/wasm\/[^/]+\/libopencor\.js"/g,
                '"/libopencor/libopencor.js"',
              ),
              map: null,
            };
          }
        },
      },
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

      // Proxy /libopencor/* requests to the libOpenCOR server, so the worker constructed inside libopencor.js loads
      // from a same-origin path (new Worker() requires the worker script to be same-origin with the page).

      proxy: {
        "/libopencor": {
          target: libopencorUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/libopencor/, ""),
        },
      },

      // Emscripten pthreads require SharedArrayBuffer, which needs cross-origin isolation.

      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    };

    // Exclude @opencor/opencor from Vite's pre-bundling so our transform plugin above can rewrite the import URL in
    // opencor.es.js.

    config.optimizeDeps = {
      exclude: ["@opencor/opencor"],
    };
    config.define = {
      "process.env.HTTP_PROXY": 8081,
      global: "globalThis",
    };
  }

  return config;
});
