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
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@use '@/assets/styles' as *;`,
        },
      },
    },
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

      // Serve libOpenCOR for OpenCOR's runtime probe.
      //
      // In @opencor/opencor, opencor.es.js locates its glue code at runtime:
      //   new URL("libopencor/downloads/wasm/<version>/libopencor.js", document.baseURI).href
      // and fetches that same-origin path (HEAD) before falling back to opencor.ws. The WASM is always loaded from a
      // hardcoded opencor.ws base via locateFile. The probe is evaluated at runtime and the glue is imported
      // dynamically (with @vite-ignore), so there is no static URL for Vite to rewrite.
      //
      // The probe is satisfied by:
      //   - Dev (serve): serving "/libopencor/*" from the installed package via the middleware below, so the probe
      //                  resolves same-origin (required for pthread Workers).
      //   - Build (lib): copying the package's libOpenCOR dir to dist/libopencor via closeBundle, so the
      //                  document-relative probe hits when the page is served from the dist root (otherwise OpenCOR
      //                  falls back to opencor.ws).

      {
        name: "opencor-libopencor",
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
          // Copy liboOpenCOR to the dist root (dist/libopencor) so that OpenCOR's document-relative probe
          // (`<baseURI>/libopencor/downloads/wasm/<version>/libopencor.js`) resolves: in app mode, dist is the
          // deployment root, and in lib mode the probed files ship in the package for consumers that serve them at the
          // page root (everyone else falls back to opencor.ws).

          if (!fs.existsSync(libopencorDir)) {
            return;
          }

          const targetDir = path.join(
            path.resolve(__dirname, "dist"),
            "libopencor",
          );

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
                "@abi-software/plotvuer",
                "@abi-software/plotvuer/dist/style.css",
              ],
              output: {
                globals: {
                  vue: "Vue",
                  "@abi-software/plotvuer": "@abi-software/plotvuer",
                },
                // keep css output name stable for the "./dist/style.css" export/import paths
                assetFileNames: (assetInfo) =>
                  assetInfo.name?.endsWith(".css")
                    ? "style.css"
                    : "assets/[name][extname]",
              },
            },
          },
    resolve: {
      alias: {
        "@": pathSrc,
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
