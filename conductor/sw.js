// ============================================================
// LO JUSTO - SERVICE WORKER
// ============================================================

const CACHE_NAME = "lo-justo-conductor-v1";

const ARCHIVOS_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];


// ============================================================
// INSTALACIÓN
// ============================================================

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(ARCHIVOS_CACHE);

      })

  );

  self.skipWaiting();

});


// ============================================================
// ACTIVACIÓN
// ============================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()
      .then((cacheNames) => {

        return Promise.all(

          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME
            )
            .map(
              (cacheName) =>
                caches.delete(cacheName)
            )

        );

      })

  );

  self.clients.claim();

});


// ============================================================
// PETICIONES
// ============================================================

self.addEventListener("fetch", (event) => {

  // Firebase, autenticación y recursos externos
  // deben consultar la red.

  if (
    event.request.url.includes("firebaseio.com") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("gstatic.com")
  ) {

    return;

  }


  event.respondWith(

    caches.match(event.request)
      .then((respuestaCache) => {

        if (respuestaCache) {

          return respuestaCache;

        }


        return fetch(event.request)
          .then((respuestaRed) => {

            if (
              !respuestaRed ||
              respuestaRed.status !== 200 ||
              respuestaRed.type === "opaque"
            ) {

              return respuestaRed;

            }


            const copia =
              respuestaRed.clone();


            caches.open(CACHE_NAME)
              .then((cache) => {

                cache.put(
                  event.request,
                  copia
                );

              });


            return respuestaRed;

          });

      })

  );

});
