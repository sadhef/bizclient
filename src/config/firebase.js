import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC7A0_RCzkkUXQU48efHdvqp4ZyFw42hgw",
  authDomain: "biztras-4a141.firebaseapp.com",
  projectId: "biztras-4a141",
  storageBucket: "biztras-4a141.firebasestorage.app",
  messagingSenderId: "210668459168",
  appId: "1:210668459168:web:2a69deeb587f21a2b265c5",
  measurementId: "G-ZF700C6KE4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, messaging, analytics };