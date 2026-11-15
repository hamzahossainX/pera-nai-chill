// Service worker for Pera Nai Chill (offline fallback).
//
// Only content-hashed build output may be served from the cache without asking the
// network. Everything else (the HTML, and public/ files such as the character SVGs
// that are updated in place under the same URL) goes to the network first, so a
// deploy is visible on the very next load; the cache is just the offline fallback.
//
// The previous version answered every request from the cache and refreshed it in
// the background. After a deploy that served the OLD HTML, whose script URLs no
// longer exist on the server: the page showed its splash but never started until it
// was reloaded. It also served the old art for one load after an in-place update.

const CACHE_NAME = "pernaichill-v2"; // bump to drop the caches of older versions
const PRECACHE = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Next.js names everything under /_next/static/ after its content (or its build id),
// so a cached copy can never be out of date.
const isImmutable = (url) => url.pathname.startsWith("/_next/static/");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // add one by one: a single missing file must not fail the whole install
      Promise.all(PRECACHE.map((path) => cache.add(path).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const stale = (await caches.keys()).filter((key) => key !== CACHE_NAME);
      await Promise.all(stale.map((key) => caches.delete(key)));
      await self.clients.claim();

      // Upgrading from an older worker: pages it served may be stuck on stale HTML
      // (see above). Reload them once so they come up on the current version.
      if (stale.length > 0) {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => client.navigate(client.url).catch(() => {}));
      }
    })()
  );
});

const remember = (event, request, response) => {
  // 206 (range requests, e.g. audio) cannot be cached
  if (response.status !== 200) return;
  const copy = response.clone();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
};

const cacheFirst = async (event, request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  remember(event, request, response);
  return response;
};

const networkFirst = async (event, request) => {
  try {
    const response = await fetch(request);
    remember(event, request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const shell = await caches.match("/");
      if (shell) return shell;
    }
    return Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Cross-origin requests (the MediaPipe wasm and model on CDNs) are left to the browser.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    isImmutable(url) ? cacheFirst(event, request) : networkFirst(event, request)
  );
});
