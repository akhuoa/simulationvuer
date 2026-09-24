// Cross-origin isolation service worker for the docs.
//
// libOpenCOR is built with Emscripten pthreads, which need SharedArrayBuffer (i.e., a shared WebAssembly.Memory),
// which browsers only allow on cross-origin isolated pages. That requires the Cross-Origin-Opener-Policy and
// Cross-Origin-Embedder-Policy response headers, which the dev server sends, but static hosts like GitHub Pages can't.
// So this service worker adds them to every response in its scope (see the registration script in
// docs/.vitepress/config.js).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Work around a Chrome bug where "only-if-cached" requests fail unless they are same-origin.

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  event.respondWith(
    fetch(request).then((response) => {
      // Opaque responses (from no-cors cross-origin requests) can't be modified, so return them as is.

      if (response.status === 0) {
        return response;
      }

      const headers = new Headers(response.headers);

      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }),
  );
});
