/* LabColloid service worker — всё кэшируется при первом открытии, дальше приложение работает без сети. */
const CACHE = 'labcolloid-32983e7de9';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('labcolloid-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => {
    if (hit) {
      // обновляем кэш в фоне, пользователь видит новую версию при следующем запуске
      fetch(req).then((r) => { if (r && r.ok) caches.open(CACHE).then((c) => c.put(req, r)); }).catch(() => {});
      return hit;
    }
    return fetch(req).then((r) => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; })
      .catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
  }));
});
