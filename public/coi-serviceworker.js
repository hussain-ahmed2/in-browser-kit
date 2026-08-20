let coepCredentialless = false;
if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) return;
    if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then((clients) => clients.forEach((client) => client.navigate(client.url)));
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;

    const request = (coepCredentialless && r.mode === "no-cors")
      ? new Request(r, { credentials: "omit" })
      : r;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
          newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
          if (!coepCredentialless) newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

          return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const coi = {
      shouldRegister: () => true,
      shouldDeregister: () => false,
      coepCredentialless: () => false,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi,
    };

    const n = navigator;
    if (n.serviceWorker && n.serviceWorker.controller) {
      n.serviceWorker.controller.postMessage({ type: "coepCredentialless", value: coi.coepCredentialless() });
      if (coi.shouldDeregister()) {
        n.serviceWorker.controller.postMessage({ type: "deregister" });
      }
    }

    if (n.serviceWorker && !window.crossOriginIsolated) {
      n.serviceWorker.register(window.document.currentScript.src).then(
        (registration) => {
          if (!coi.quiet) console.log("COOP/COEP service worker registered", registration.scope);
          registration.addEventListener("updatefound", () => {
            if (!coi.quiet) console.log("Reloading page to make use of updated COOP/COEP service worker.");
            coi.doReload();
          });
          if (registration.active && !n.serviceWorker.controller) {
            if (!coi.quiet) console.log("Reloading page to make use of newly registered COOP/COEP service worker.");
            coi.doReload();
          }
        },
        (err) => { if (!coi.quiet) console.error("COOP/COEP service worker failed to register:", err); }
      );
    }
  })();
}
