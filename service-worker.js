const CACHE_NAME = 'spacetech-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/products.html',
  '/about.html',
  '/contact.html',
  '/offline.html', 
  '/css/style.css',
  '/js/app.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

//Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Dosyalar önbelleğe alınıyor...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

//Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {

      return response || fetch(event.request).catch(() => {
        

        if (event.request.headers.get('accept').includes('text/html')) {
           return caches.match('/offline.html');
        }
        
      });
    })
  );
});

//Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Eski cache siliniyor:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});