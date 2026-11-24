// Fretboard Practice: keeps the page working offline. When online, the page always checks GitHub for the newest version.
const CACHE = "fretboard-v8";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("fretboard-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== self.location.origin && !fonts) return; // Songsterr, Drive and other sites go straight to the browser
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html").then(hit => hit || new Response("Offline", {status: 503, headers: {"Content-Type": "text/plain"}}))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => new Response("", {status: 503}))));
});
