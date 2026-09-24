import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libopencorDir = path.resolve(__dirname, 'node_modules/@opencor/opencor/dist/libopencor');

// Serve libOpenCOR for OpenCOR's runtime probe.
//
// In @opencor/opencor, opencor.es.js locates its glue code at runtime:
//   new URL("libopencor/downloads/wasm/<version>/libopencor.js", document.baseURI).href
// and fetches that same-origin path (HEAD) before falling back to opencor.ws. The WASM is always loaded from a
// hardcoded opencor.ws base via locateFile. The probe is evaluated at runtime and the glue is imported
// dynamically (with @vite-ignore), so there is no static URL for Vite to rewrite.
//
// The probe is satisfied by:
//   - Dev (serve): serving "<base>libopencor/*" from the installed package via the middleware below, so the probe
//                  resolves same-origin (required for pthread Workers).
//   - Build: copying the package's libOpenCOR dir to <outDir>/libopencor via closeBundle, so the document-relative
//            probe hits when the page is served from the output root (otherwise OpenCOR falls back to opencor.ws).
//
// The base and outDir come from the resolved config, so the same plugin works for both the app/library (base "/",
// outDir "dist") and the VitePress docs (base "/simulationvuer/", outDir "docs/.vitepress/dist").


export default function libopencor() {
  let resolvedConfig;

  return {
    name: 'opencor-libopencor',
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      // Serve libopencor files from @opencor/opencor during development so the dynamic import in opencor.es.js
      // resolves same-origin (required for pthread Workers).
      // Note: a relative base (e.g., "./" in app mode) is served from "/" in dev.

      const base = resolvedConfig.base.startsWith('/') ? resolvedConfig.base : '/';
      const prefix = `${base.endsWith('/') ? base : `${base}/`}libopencor/`;

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
          pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch {
          next();

          return;
        }

        if (!pathname.startsWith(prefix)) {
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
          filePath = fs.realpathSync(path.resolve(libopencorDir, pathname.slice(prefix.length)));
        } catch {
          next();

          return;
        }

        // Reject paths escaping the directory: exactly "..", starting with "../", or absolute (e.g., a
        // different drive on Windows).
        // Note: a plain startsWith("..") check would wrongly reject legitimate files like "..foo.js".

        const relative = path.relative(realLibopencorDir, filePath);

        if (
          relative === '' ||
          relative === '..' ||
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
          'Content-Type': 'application/javascript',
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Resource-Policy': 'same-origin',
        });
        res.end(content);
      });
    },
    closeBundle() {
      // Copy libOpenCOR to the output root (<outDir>/libopencor) so that OpenCOR's document-relative probe
      // (`<baseURI>/libopencor/downloads/wasm/<version>/libopencor.js`) resolves: in app mode and for the docs, the
      // output dir is the deployment root, and in lib mode the probed files ship in the package for consumers that
      // serve them at the page root (everyone else falls back to opencor.ws).
      // Note: SSR builds (e.g., VitePress' server-side render pass) don't produce a deployable output, so skip them.

      if (resolvedConfig.build.ssr || !fs.existsSync(libopencorDir)) {
        return;
      }

      const targetDir = path.join(
        path.resolve(resolvedConfig.root, resolvedConfig.build.outDir),
        'libopencor',
      );

      fs.cpSync(libopencorDir, targetDir, { recursive: true, force: true });
    },
  };
}
