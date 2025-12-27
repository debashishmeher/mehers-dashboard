// sw.js
const CACHE_NAME = 'notification-cache-v1';
const ASSETS_TO_CACHE = [
  '/icon.png',
  '/badge.png'
];

// Install and cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');

  // Default notification data
  const defaultData = {
    title: 'New Notification',
    body: 'You have a new message',
    icon: '/icon.png',
    badge: '/badge.png',
    url: '/', // Default URL to open when clicked
    data: {} // Additional data to pass
  };

  let notificationData = {...defaultData};

  try {
    if (event.data) {
      const data = event.data.json();
      notificationData = {
        ...defaultData,
        ...data,
        icon: data.icon || defaultData.icon,
        badge: data.badge || defaultData.badge,
        url: data.url || defaultData.url
      };
    }
  } catch (e) {
    console.log('[Service Worker] Parsing push data failed:', e);
    if (event.data && event.data.text()) {
      notificationData.body = event.data.text();
    }
  }

  console.log('[Service Worker] Showing notification:', notificationData);

  // Store notification data in cache for click handling
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.put(
        `notification-${Date.now()}`,
        new Response(JSON.stringify(notificationData))
      )
      .then(() => {
        return self.registration.showNotification(
          notificationData.title,
          {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            data: { url: notificationData.url, ...notificationData.data }
          }
        );
      })
      .catch(error => {
        console.error('[Service Worker] Notification error:', error);
      })
    )
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');

  // Close the notification
  event.notification.close();

  // Extract the URL from notification data
  const urlToOpen = event.notification.data.url || '/';

  // Open or focus the URL
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a tab open with this URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no matching tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});