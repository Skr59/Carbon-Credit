const CACHE = "kisan-carbon-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && (res.status === 200 || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch((err) => {
        return (
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            throw err;
          })
        );
      })
  );
});