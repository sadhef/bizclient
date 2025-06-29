// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7A0_RCzkkUXQU48efHdvqp4ZyFw42hgw",
  authDomain: "biztras-4a141.firebaseapp.com",
  projectId: "biztras-4a141",
  storageBucket: "biztras-4a141.firebasestorage.app",
  messagingSenderId: "210668459168",
  appId: "1:210668459168:web:2a69deeb587f21a2b265c5",
  measurementId: "G-ZF700C6KE4"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'BizTras Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/biztras.png',
    badge: '/biztras.png',
    tag: 'biztras-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: payload.data?.clickAction || '/',
      timestamp: payload.data?.timestamp || Date.now()
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // If the target URL is different, navigate to it
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
  // 'dismiss' action just closes the notification (handled above)
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Optional: Track notification dismissals
});