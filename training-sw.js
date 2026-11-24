// Training Cards: keeps my app working at the gym without signal. When online, it checks GitHub for the newest version.
const CACHE = "training-cards-v2026-11-24f";
const CORE = ["./Training_Cards_App.html", "./training-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("training-cards-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./Training_Cards_App.html", copy)); } return res; })
      .catch(() => caches.match("./Training_Cards_App.html").then(hit => hit || new Response("Offline", {status: 503}))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
});
