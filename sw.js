// Version control
const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `boda-cache-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // CSS
  '/css/styles.css',
  '/css/intro.css',
  '/css/animations.css',
  '/css/responsive.css',
  
  // JavaScript
  '/js/intro.js',
  '/js/main.js',
  '/js/countdown.js',
  '/js/form.js',
  '/js/animations.js',
  
  // Fonts
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // Critical images
  '/assets/images/favicon.ico',
  '/assets/images/hero-poster.jpg',
  '/assets/images/location.jpg',
  '/assets/images/og-image.jpg',
  
  // Critical audio
  '/assets/audio/background-music.mp3'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS)
          .then(() => {
            console.log('[Service Worker] All resources cached');
            return self.skipWaiting();
          })
          .catch(error => {
            console.error('[Service Worker] Cache addAll error:', error);
          });
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Skip analytics requests
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('gtag')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found and not too old
        if (cachedResponse) {
          // Update cache in background
          fetchAndCache(event.request);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response to cache it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // If offline and requesting a page, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // For images, return placeholder
            if (event.request.destination === 'image') {
              return caches.match('/assets/images/placeholder.jpg');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Helper function to fetch and cache in background
function fetchAndCache(request) {
  fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
      }
    })
    .catch(() => {
      // Silently fail if network is unavailable
    });
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rsvp') {
    event.waitUntil(syncRSVPData());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva actualización de la boda',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/assets/images/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/images/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Boda Jeison y Sonia', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Do nothing
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic sync for updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

// Update cached content periodically
async function updateCachedContent() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.log(`Failed to update ${request.url}:`, error);
    }
  }
}

// Sync RSVP data when online
async function syncRSVPData() {
  const db = await openRSVPDatabase();
  const pendingSubmissions = await db.getAll('pending');
  
  for (const submission of pendingSubmissions) {
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission.data)
      });
      
      if (response.ok) {
        await db.delete('pending', submission.id);
      }
    } catch (error) {
      console.error('Failed to sync RSVP:', error);
    }
  }
}

// IndexedDB for offline RSVP storage
function openRSVPDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('boda-rsvp', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending')) {
        const store = db.createObjectStore('pending', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});