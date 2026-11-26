// Fretboard Practice: keeps my app and its fonts working offline. When online, the page always checks GitHub for the newest version.
// Only my own files: Songsterr, forScore, Drive, YouTube and other sites go straight to the browser.
const CACHE = "fretboard-v12";
const FONTS = ["barlow-condensed-latin-600-normal","barlow-condensed-latin-700-normal","source-sans-3-latin-400-normal","source-sans-3-latin-400-italic","source-sans-3-latin-600-normal","source-sans-3-latin-700-normal","ibm-plex-mono-latin-400-normal","ibm-plex-mono-latin-600-normal"].map(n => "./fonts/" + n + ".woff2");
const CORE = ["./", "./index.html", "./library.js", "./manifest.json", "./icon-180.png", "./icon-512.png", ...FONTS];
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
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); } return res; })
      .catch(() => caches.match("./index.html").then(hit => hit || new Response("Offline", {status: 503, headers: {"Content-Type": "text/plain"}}))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res;
  }).catch(() => new Response("", {status: 503}))));
});
