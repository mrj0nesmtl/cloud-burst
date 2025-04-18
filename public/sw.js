// Service Worker for Cloud Burst PWA
const CACHE_NAME = 'cloudburst-cache-v1';
const OFFLINE_URL = '/offline.html';

// Add assets to cache during installation
const urlsToCache = [
  '/',
  OFFLINE_URL,
  '/favicon.png',
  '/logo-192.png',
  '/logo-512.png',
  '/manifest.json',
  '/styles/globals.css'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently (no caching)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the response is valid, clone it and store it in the cache
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // When network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If request is for a page, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // If request is for an image, return a default image
            if (event.request.destination === 'image') {
              return caches.match('/images/offline-image.png');
            }
            
            // Otherwise just return the offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Sync event for background syncing
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

// Background sync function for uploads
async function syncUploads() {
  try {
    const pendingUploads = await getPendingUploads();
    for (const upload of pendingUploads) {
      await sendUpload(upload);
      await markUploadComplete(upload.id);
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Background sync failed:', error);
    return Promise.reject(error);
  }
}

// Utility functions for backgroundSync
async function getPendingUploads() {
  // This would normally access IndexedDB
  // Simplified version for demonstration
  return [];
}

async function sendUpload(upload) {
  // This would normally send the upload to the server
  // Simplified version for demonstration
  return Promise.resolve();
}

async function markUploadComplete(id) {
  // This would normally update IndexedDB
  // Simplified version for demonstration
  return Promise.resolve();
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const notification = event.data.json();
  const title = notification.title || 'Cloud Burst';
  const options = {
    body: notification.body,
    icon: '/logo-192.png',
    badge: '/favicon.png',
    data: notification.data
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // Check if there's already a window with the URL open
      let matchingClient = windowClients.find(
        (client) => client.url === urlToOpen
      );
      
      if (matchingClient) {
        return matchingClient.focus();
      }
      
      // Otherwise, open a new window
      return clients.openWindow(urlToOpen);
    })
  );
}); 