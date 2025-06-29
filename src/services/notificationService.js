import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";
import { toast } from "react-toastify";

class NotificationService {
  constructor() {
    this.isSupported = this.checkSupport();
    this.vapidKey = "BDnYkdNVDJJwXV7hwtzREcXoWYtk_xbDpYb_3Y7BZ1SDwdnFBR-GtaHqeM_2IkNSKLDKGLZet5C_kRneCChoRqQ";
  }

  // Check if notifications are supported
  checkSupport() {
    return "serviceWorker" in navigator && "Notification" in window && messaging;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error("Notifications are not supported on this device");
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        console.log("Notification permission granted");
        return await this.getFCMToken();
      } else {
        throw new Error("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      throw error;
    }
  }

  // Get FCM registration token
  async getFCMToken() {
    try {
      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        console.log("FCM registration token:", token);
        return token;
      } else {
        throw new Error("No registration token available");
      }
    } catch (error) {
      console.error("An error occurred while retrieving token:", error);
      throw error;
    }
  }

  // Listen for foreground messages
  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
        
        // Show toast notification
        toast.info(
          <div>
            <strong>{payload.notification?.title}</strong>
            <br />
            {payload.notification?.body}
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        resolve(payload);
      });
    });
  }

  // Send token to backend for storage
  async saveTokenToDatabase(token, userId) {
    try {
      const response = await fetch("/api/notifications/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          token,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save token to database");
      }

      console.log("Token saved to database successfully");
    } catch (error) {
      console.error("Error saving token to database:", error);
      throw error;
    }
  }
}

export default new NotificationService();