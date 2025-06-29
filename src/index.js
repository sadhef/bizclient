import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for push notifications and offline functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully:', registration);
    
    // Check if the service worker is ready for push notifications
    if ('PushManager' in window && 'serviceWorker' in navigator) {
      console.log('Push notifications are supported');
    }
  },
  onUpdate: (registration) => {
    console.log('Service Worker updated:', registration);
    
    // Optionally, you can notify the user about the update
    if (registration && registration.waiting) {
      // New service worker is waiting to activate
      console.log('New version available! Please refresh the page.');
    }
  }
});

// Register the Firebase messaging service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase messaging service worker registered:', registration);
    })
    .catch((error) => {
      console.error('Firebase messaging service worker registration failed:', error);
    });
}

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'production') {
  // Log any unhandled errors
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}