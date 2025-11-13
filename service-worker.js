// service-worker.js
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("doodlebase-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./css/index.css",
        "./css/layout.css",
        "./css/controls.css",
        "./js/controls.js",
        "./js/drawing.js",
        "./js/rive.js",
        "./assets/poses/pose1.svg",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
