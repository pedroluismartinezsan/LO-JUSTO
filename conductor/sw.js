// ============================================================
// LO JUSTO - SERVICE WORKER
// ============================================================

const CACHE_NAME = "lo-justo-conductor-v2";

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

  const url = new URL(event.request.url);


  // ----------------------------------------------------------
  // SOLO MANEJAMOS PETICIONES HTTP/HTTPS
  // ----------------------------------------------------------

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {

    return;

  }


  // ----------------------------------------------------------
  // FIREBASE Y RECURSOS EXTERNOS
  // ----------------------------------------------------------

  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com")
  ) {

    return;

  }


  // ----------------------------------------------------------
  // PETICIONES DE LA APLICACIÓN
  // ----------------------------------------------------------

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
              respuestaRed.status !== 200
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

              })
              .catch((error) => {

                console.warn(
                  "No se pudo guardar en caché:",
                  error
                );

              });


            return respuestaRed;

          });

      })

  );

});
