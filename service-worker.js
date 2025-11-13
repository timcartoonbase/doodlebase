// service-worker.js
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("doodlebase-cache-v1").then((cache) => {
      return cache.addAll([
        "/doodlebase/",
        "/doodlebase/index.html",
        "/doodlebase/css/index.css",
        "/doodlebase/css/layout.css",
        "/doodlebase/css/controls.css",
        "/doodlebase/js/controls.js",
        "/doodlebase/js/drawing.js",
        "/doodlebase/js/rive.js",
        "/doodlebase/assets/poses/pose1.svg",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
