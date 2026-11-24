// Golf Practice: keeps the app working at the dome without signal. When online, it checks GitHub for the newest version.
const CACHE = "golf-practice-v2026-11-24c";
const IMGS = ["rope3d","hinge3d","load3d","balance3d","towel3d","towel_top","setup3d","impact3d","finish3d","onehand3d","carpet","dots","10ball","toptracer","par18_top","p_gate","p_ladder","p_speed"].map(n => "./img/" + n + ".png");
const CORE = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png", ...IMGS];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html").then(hit => hit || new Response("Offline", {status: 503}))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
