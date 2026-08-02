import vue from "@vitejs/plugin-vue";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathSrc = path.resolve(__dirname, "./src");
const libopencorDir = path.resolve(
  __dirname,
  "node_modules/@opencor/opencor/dist/libopencor",
);

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

      // Resolve the libopencor.js import URL in @opencor/opencor's opencor.es.js so that it works for all consumers
      // (not just Vite projects) and this without server configuration.
      //
      // In @opencor/opencor, the code uses:
      //   new URL("./libopencor/wasm/<version>/libopencor.js", window.location.href).href
      //
      // This resolves relative to the page URL, requiring the server to host libopencor.js at a page-relative path
      // (which doesn't work for library consumers or static builds).
      //
      // We fix this by:
      //   - Dev (serve): rewriting to "/libopencor/libopencor.js", served by the middleware below.
      //   - Build (lib): rewriting to use import.meta.url, so the import resolves relative to simulationvuer.js's URL
      //                  (same directory, libopencor.js is copied alongside it via closeBundle).

      {
        name: "opencor-libopencor",
        transform(code, id) {
          if (id.includes("@opencor/opencor") && id.endsWith("opencor.es.js")) {
            const importRegex =
              /(\/\*\s*@vite-ignore\s*\*\/[\s\n]*)(new URL\("(\.\/libopencor\/wasm\/[^/]+\/libopencor\.js)",\s*window\.location\.href\)\.href)/g;
            const res = code.replace(
              importRegex,
              (_match, prefix, _urlExpr, urlPath) => {
                if (command === "serve") {
                  // Dev mode: absolute path served by the middleware below.

                  return `${prefix}"/libopencor/libopencor.js"`;
                }

                // Build mode: resolve relative to the bundle's own URL.
                // Note: we use replace() instead of new URL(..., import.meta.url) to avoid Vite's asset handler, which
                //       would inline the file as a data: URL (which breaks Emscripten's pthread Worker creation). At
                //       runtime, import.meta.url points to simulationvuer.js and the derived path correctly reaches
                //       libopencor in the same directory (copied alongside by closeBundle).

                return `${prefix}import.meta.url.replace(/[^/]*$/, "") + ${JSON.stringify(urlPath.substring(2))}`;
              },
            );

            if (res !== code) {
              return {
                code: res,
                map: null,
              };
            }
          }
        },
        configureServer(server) {
          // Serve libopencor files from @opencor/opencor during development so the dynamic import in opencor.es.js
          // resolves same-origin (required for pthread Workers).

          // Resolve symlinks in libopencorDir once so the per-request guard compares real paths on both sides.

          let realLibopencorDir;

          try {
            realLibopencorDir = fs.realpathSync(libopencorDir);
          } catch {
            realLibopencorDir = libopencorDir;
          }

          server.middlewares.use((req, res, next) => {
            // Parse the URL to strip any query string, and decode it safely (malformed sequences are rejected).

            let pathname;

            try {
              pathname = decodeURIComponent(
                new URL(req.url, "http://localhost").pathname,
              );
            } catch {
              next();

              return;
            }

            if (!pathname.startsWith("/libopencor/")) {
              next();

              return;
            }

            // Resolve the requested subpath and verify the result stays within libopencorDir, guarding against
            // directory traversal (e.g., "/libopencor/../../..." or percent-encoded ".." segments) and symlink
            // escapes (a symlink inside libopencorDir pointing outside would pass a purely lexical check).
            // Note: realpathSync() resolves symlinks, so a symlink pointing outside libopencorDir resolves to a path
            //       outside it, which the relative check below rejects. It also throws if the path doesn't exist.

            let filePath;

            try {
              filePath = fs.realpathSync(
                path.resolve(
                  libopencorDir,
                  pathname.slice("/libopencor/".length),
                ),
              );
            } catch {
              next();

              return;
            }

            // Reject paths escaping the directory: exactly "..", starting with "../", or absolute (e.g., a
            // different drive on Windows).
            // Note: a plain startsWith("..") check would wrongly reject legitimate files like "..foo.js".

            const relative = path.relative(realLibopencorDir, filePath);

            if (
              relative === "" ||
              relative === ".." ||
              relative.startsWith(`..${path.sep}`) ||
              path.isAbsolute(relative)
            ) {
              next();

              return;
            }

            // Read the file and serve it with the correct headers.

            let content;

            try {
              if (!fs.statSync(filePath).isFile()) {
                next();

                return;
              }

              content = fs.readFileSync(filePath);
            } catch {
              next();

              return;
            }

            res.writeHead(200, {
              "Content-Type": "application/javascript",
              "Cross-Origin-Embedder-Policy": "require-corp",
              "Cross-Origin-Resource-Policy": "same-origin",
            });
            res.end(content);
          });
        },
        closeBundle() {
          // Copy libopencor alongside the built JavaScript file so that the dynamic import (using import.meta.url as
          // base) resolves correctly. App mode puts the built JavaScript file in dist/assets while lib mode puts it in
          // dist.

          if (!fs.existsSync(libopencorDir)) {
            return;
          }

          const distDir = path.resolve(__dirname, "dist");
          const targetDir = fs.existsSync(path.join(distDir, "assets"))
            ? path.join(distDir, "assets", "libopencor")
            : path.join(distDir, "libopencor");

          fs.cpSync(libopencorDir, targetDir, { recursive: true, force: true });
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
