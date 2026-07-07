// ResumeBuilder Pro Service Worker
// Minimal offline shell cache with safe caching rules.

const CACHE_NAME = "resumebuilder-shell-v2";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ===============================
// Install
// ===============================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );

  self.skipWaiting();
});

// ===============================
// Activate
// ===============================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// ===============================
// Fetch
// ===============================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Cache only GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Ignore browser extension requests
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:" ||
    url.protocol === "safari-extension:"
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {

        // Only cache successful HTTP/HTTPS responses
        if (
          response.ok &&
          (url.protocol === "http:" || url.protocol === "https:")
        ) {
          const responseClone = response.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone))
            .catch(() => {
              // Ignore cache failures
            });
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        // Offline fallback for page navigation
        if (request.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) {
            return fallback;
          }
        }

        return Response.error();
      })
  );
});