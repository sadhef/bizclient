importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration with updated Sender ID
const firebaseConfig = {
  apiKey: "AIzaSyC7A0_RCzkkUXQU48efHdvqp4ZyFw42hgw",
  authDomain: "biztras-4a141.firebaseapp.com",
  projectId: "biztras-4a141",
  storageBucket: "biztras-4a141.firebasestorage.app",
  messagingSenderId: "210668459168", // Updated Sender ID
  appId: "1:210668459168:web:2a69deeb587f21a2b265c5",
  measurementId: "G-ZF700C6KE4"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'BizTras Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/biztras.png',
    badge: '/biztras.png',
    tag: 'biztras-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/biztras.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: payload.data?.clickAction || payload.data?.url || '/',
      timestamp: payload.data?.timestamp || Date.now(),
      notificationId: payload.messageId || Date.now()
    }
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  // Close the notification
  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    console.log('Notification dismissed by user');
    return;
  }

  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          // Focus the existing window and navigate if needed
          if (urlToOpen !== '/') {
            return client.navigate(urlToOpen).then(() => client.focus());
          }
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }).catch((error) => {
      console.error('Error handling notification click:', error);
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification closed:', event);
  
  // Optional: Track notification dismissals
  // You can send analytics data here if needed
});

// Service worker update handling
self.addEventListener('install', (event) => {
  console.log('🔧 Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service worker activated');
  event.waitUntil(clients.claim());
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  console.log('🔔 Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    // Show notification if not handled by messaging
    const title = data.notification?.title || 'BizTras';
    const options = {
      body: data.notification?.body || 'New notification',
      icon: '/biztras.png',
      badge: '/biztras.png',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});