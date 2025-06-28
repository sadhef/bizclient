const CACHE_NAME = 'biztras-todo-v1';
const API_BASE_URL = self.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://your-api-domain.com';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/biztras.png',
        '/manifest.json'
      ]).catch((error) => {
        console.log('Cache addAll failed:', error);
        // Don't fail installation if cache fails
        return Promise.resolve();
      });
    })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
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
    })
  );
  
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith(API_BASE_URL)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).catch(() => {
        // If network fails and it's a navigation request, return offline page
        if (event.request.mode === 'navigate') {
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Offline - BizTras</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .offline-message { max-width: 400px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="offline-message">
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
                <button onclick="window.location.reload()">Retry</button>
              </div>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {
      title: 'BizTras Todo',
      body: 'You have a new notification',
      icon: '/biztras.png'
    };
  }

  const {
    title = 'BizTras Todo',
    body = 'You have a new notification',
    icon = '/biztras.png',
    badge = '/biztras.png',
    data = {},
    actions = []
  } = notificationData;

  const notificationOptions = {
    body,
    icon,
    badge,
    data,
    actions,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: data.taskId || 'todo-notification',
    renotify: true
  };

  // Show notification
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('Notification shown successfully');
        
        // Send acknowledgment back to server (optional)
        if (data.taskId) {
          fetch(`${API_BASE_URL}/api/notifications/acknowledge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              taskId: data.taskId,
              notificationType: data.type
            })
          }).catch(error => {
            console.error('Error acknowledging notification:', error);
          });
        }
      })
      .catch(error => {
        console.error('Error showing notification:', error);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const { notification } = event;
  const { data } = notification;
  
  notification.close();

  // Handle action clicks
  if (event.action) {
    event.waitUntil(
      handleNotificationAction(event.action, data)
    );
    return;
  }

  // Default click behavior - open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const targetUrl = data.url || '/cloud-dashboard';
        
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('/cloud-dashboard') && 'focus' in client) {
            client.focus();
            if (data.taskId) {
              client.postMessage({
                type: 'NAVIGATE_TO_TASK',
                taskId: data.taskId
              });
            }
            return;
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification actions
async function handleNotificationAction(action, data) {
  try {
    switch (action) {
      case 'view':
        // Open the task details
        const clients = await self.clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        });
        
        for (const client of clients) {
          if (client.url.includes('/cloud-dashboard') && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NAVIGATE_TO_TASK',
              taskId: data.taskId
            });
            return;
          }
        }
        
        if (self.clients.openWindow) {
          await self.clients.openWindow(`/cloud-dashboard?task=${data.taskId}`);
        }
        break;
        
      case 'complete':
        // Mark task as completed (would need authentication token)
        try {
          await self.registration.showNotification('Task Action', {
            body: 'Please open the app to complete this action',
            icon: '/biztras.png',
            tag: 'action-required'
          });
        } catch (error) {
          console.error('Error showing action notification:', error);
        }
        break;
        
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Error handling notification action:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'todo-sync') {
    event.waitUntil(syncTodoData());
  }
});

// Sync todo data when coming back online
async function syncTodoData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_TODO_DATA'
      });
    });
  } catch (error) {
    console.error('Error syncing todo data:', error);
  }
}

// Message handling from clients
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(data.urls).catch(error => {
            console.error('Error caching URLs:', error);
          });
        })
      );
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});