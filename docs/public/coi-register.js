// Register the cross-origin isolation service worker (see coi-serviceworker.js)
// when the host doesn't send the COOP/COEP headers (e.g., GitHub Pages),
// and reload once so that the page is served through it.
// Note: this is loaded as a classic (i.e., non-module) script from the docs' head and, on GitHub Pages, from the app's
//       head (see .github/workflows/deploy.yml). The service worker is located relative to this script, so its scope
//       (i.e., the docs' base) also covers the app deployed under it.
// Note: the reload is only done once per session to avoid a reload loop if isolation still can't be achieved.

(() => {
  if (window.crossOriginIsolated || !window.isSecureContext || !('serviceWorker' in navigator)) {
    try {
      sessionStorage.removeItem('coiReloaded');
    } catch {
      // Ignore storage errors (e.g., in a private window).
    }

    return;
  }

  const reload = () => {
    try {
      if (sessionStorage.getItem('coiReloaded')) {
        return;
      }

      sessionStorage.setItem('coiReloaded', '1');
    } catch {
      // Ignore storage errors (e.g., in a private window).
    }

    location.reload();
  };

  const serviceWorkerUrl = new URL('coi-serviceworker.js', document.currentScript.src);

  navigator.serviceWorker.register(serviceWorkerUrl).then((registration) => {
    if (navigator.serviceWorker.controller) {
      return;
    }

    if (registration.active) {
      reload();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', reload);
    }
  });
})();
