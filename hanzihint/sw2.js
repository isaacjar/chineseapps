
const CACHE_NAME = "hanziclash-v2";

const CORE_FILES = [
  "index2.html",
  "manifest2.json",
  "css/style2.css",
  "js/setup2.js",
  "js/game2.js",
  "js/ui2.js",
  "js/app2.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Guarda cada archivo por separado.
    // Si alguno falla, no cancela toda la instalación.
    await Promise.all(
      CORE_FILES.map(async path => {
        try {
          const response = await fetch(path, { cache: "reload" });

          if (response.ok) {
            await cache.put(path, response);
          } else {
            console.warn(
              "HanziClash: no se pudo guardar",
              path,
              response.status
            );
          }
        } catch (error) {
          console.warn(
            "HanziClash: error al guardar",
            path,
            error
          );
        }
      })
    );

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key.startsWith("hanziclash-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Solo gestiona las peticiones del mismo dominio.
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);

      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await caches.match(event.request);

      if (cached) return cached;

      return new Response("No hay conexión y el archivo no está en caché.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
