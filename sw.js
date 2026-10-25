"use strict";
const CACHE = "stahlgewicht-v0.7.0";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./model.js",
  "./guide.css",
  "./guide.js",
  "./images/01-messstellen-as-ns.png",
  "./images/02-wuchtverfahren.png",
  "./Erklaerungsentwurf.pdf",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          ASSETS.map((url) => new Request(url, { cache: "reload" })),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("stahlgewicht-v") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    caches
      .open(CACHE)
      .then(
        async (cache) =>
          (await cache.match(event.request)) || fetch(event.request),
      ),
  );
});
