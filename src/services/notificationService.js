import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase"; // Correct path to your existing firebase config
import { toast } from "react-toastify";

class NotificationService {
  constructor() {
    this.isSupported = this.checkSupport();
    // Your VAPID key from Firebase project
    this.vapidKey = "iEFad0fTGwEuCFsUlLDXSN-9ScWYJxNoYpG7VTljRWs";
    this.baseURL = this.getBaseURL();
  }

  // Get the correct base URL for API calls
  getBaseURL() {
    if (typeof window !== 'undefined') {
      // In browser environment
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
      } else if (window.location.hostname.includes('vercel.app')) {
        return window.location.origin;
      } else {
        return window.location.origin;
      }
    }
    return '';
  }

  // Check if notifications are supported
  checkSupport() {
    return "serviceWorker" in navigator && 
           "Notification" in window && 
           "PushManager" in window &&
           messaging !== null;
  }

  // Check current permission status without requesting
  getPermissionStatus() {
    if (!this.isSupported) return 'not-supported';
    return Notification.permission;
  }

  // Request notification permission gracefully
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error("Push notifications are not supported on this device");
    }

    try {
      // Check current permission first
      const currentPermission = Notification.permission;
      
      if (currentPermission === "denied") {
        throw new Error("Notification permission was previously denied. Please enable it in your browser settings.");
      }
      
      if (currentPermission === "granted") {
        console.log("✅ Notification permission already granted");
        return await this.getFCMToken();
      }

      // Only request if permission is 'default' (not asked yet)
      if (currentPermission === "default") {
        console.log("🔔 Requesting notification permission...");
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          console.log("✅ Notification permission granted");
          return await this.getFCMToken();
        } else {
          throw new Error("Notification permission denied by user");
        }
      }
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      throw error;
    }
  }

  // Get FCM registration token
  async getFCMToken() {
    try {
      if (!messaging) {
        throw new Error("Firebase messaging not initialized");
      }

      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        console.log("✅ FCM registration token received:", token.substring(0, 20) + "...");
        return token;
      } else {
        throw new Error("No FCM registration token available. Make sure the app is registered and configured correctly.");
      }
    } catch (error) {
      console.error("❌ Error retrieving FCM token:", error);
      throw error;
    }
  }

  // Listen for foreground messages
  onMessageListener() {
    if (!messaging) {
      console.warn("⚠️ Firebase messaging not available for foreground listener");
      return;
    }

    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log("🔔 Message received in foreground:", payload);
        
        // Show toast notification
        if (toast) {
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
        }

        resolve(payload);
      });
    });
  }

  // Send token to backend for storage
  async saveTokenToDatabase(token, userId) {
    try {
      const url = `${this.baseURL}/api/notifications/token`;
      console.log('🔄 Attempting to save token to:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          token,
          userId,
          platform: 'web',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('❌ Error parsing error response:', parseError);
          }
        } else {
          // If not JSON, it might be HTML (404 page)
          const textResponse = await response.text();
          console.error('❌ Non-JSON response:', textResponse.substring(0, 200));
          errorMessage = `Server returned HTML instead of JSON. API route may not be configured properly.`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Token saved to database successfully:", result);
      return true;
    } catch (error) {
      console.error("❌ Error saving token to database:", error);
      
      // For development/demo purposes, don't throw error - just warn
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        console.warn("⚠️ Network error - continuing without saving token (this is OK for local development)");
        return false;
      }
      
      // For other errors, log but continue
      console.warn("⚠️ Token save failed but continuing:", error.message);
      return false;
    }
  }

  // Initialize notifications gracefully (non-intrusive)
  async initializeGracefully(currentUser) {
    if (!this.isSupported || !currentUser) {
      console.log("ℹ️ Notifications not supported or no user logged in");
      return { 
        success: false, 
        reason: this.isSupported ? 'no-user' : 'not-supported' 
      };
    }

    try {
      const currentPermission = Notification.permission;
      console.log("🔍 Current notification permission:", currentPermission);
      
      if (currentPermission === "granted") {
        console.log("🚀 Initializing notifications for granted permission...");
        const token = await this.getFCMToken();
        const saved = await this.saveTokenToDatabase(token, currentUser.id);
        
        // Set up message listener
        this.onMessageListener();
        
        return { 
          success: true, 
          token, 
          tokenSaved: saved,
          permission: currentPermission 
        };
      }
      
      // Don't request permission automatically - let user decide
      return { 
        success: false, 
        reason: 'permission-not-granted', 
        permission: currentPermission 
      };
    } catch (error) {
      console.error('❌ Error initializing notifications gracefully:', error);
      return { 
        success: false, 
        reason: 'error', 
        error: error.message 
      };
    }
  }

  // Test if the backend service is working
  async testConnection() {
    try {
      const url = `${this.baseURL}/api/debug/routes`;
      console.log('🧪 Testing connection to:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Backend connection test successful:', data);
          return { success: true, data };
        } else {
          const text = await response.text();
          console.error('❌ Non-JSON response from debug endpoint:', text.substring(0, 200));
          return { 
            success: false, 
            error: 'Server returned HTML instead of JSON - API routes may not be properly configured' 
          };
        }
      }
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Send a test notification (for admin testing)
  async sendTestNotification() {
    try {
      const url = `${this.baseURL}/api/notifications/test`;
      console.log('🧪 Sending test notification to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test notification sent successfully:', result);
        return { success: true, result };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Get notification statistics
  async getStats() {
    try {
      const url = `${this.baseURL}/api/notifications/stats`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        return { success: true, stats };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching notification stats:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export default new NotificationService();