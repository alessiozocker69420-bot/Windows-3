const CACHE = 'virtual-pc-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './styles/desktop.css',
  './styles/windows.css',
  './styles/apps.css',
  './manifest.json',
  './apps/terminal.js',
  './apps/notes.js',
  './apps/browser.js',
  './apps/explorer.js',
  './apps/calculator.js',
  './apps/paint.js',
  './apps/settings.js',
  './apps/calendar.js',
  './apps/clock.js',
  './apps/music.js',
  './apps/video.js',
  './apps/image-viewer.js',
  './apps/notepad.js',
  './apps/task-manager.js',
  './apps/app-store.js',
  './apps/system-info.js',
  './apps/recycle-bin.js',
  './apps/screenshot.js',
  './apps/todo.js',
  './assets/icons/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        if (resp.ok && e.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
