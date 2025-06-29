import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import CloudLogin from './components/Cloud/CloudLogin';
import Registration from './components/Auth/Registration';
import AdminLogin from './components/Admin/AdminLogin';
import Login from './components/Auth/Login';

// Challenge components
import Challenges from './components/Challenge/Challenges';
import ThankYouPage from './components/Common/ThankYouPage';

// Admin components
import AdminDashboard from './components/Admin/AdminDashboard';
import LevelManager from './components/Admin/LevelManager';
import UserProgressManager from './components/Admin/UserProgressManager';

// Cloud components
import CloudDashboard from './components/Cloud/CloudDashboard';

// Common components
import Navbar from './components/Common/Navbar';
import OfflineNotification from './components/Common/OfflineNotification';
import InstallPrompt from './components/Common/InstallPrompt';
import OfflinePage from './components/Common/OfflinePage';

// Support components
import SupportPage from './components/Support/SupportPage';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';

// Notification service
import notificationService from './services/notificationService';

// Protected Route component for authentication
const ProtectedRoute = ({ component: Component, condition, redirectPath = '/login', ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (condition) {
        return <Component {...props} />;
      } else {
        return <Redirect to={redirectPath} />;
      }
    }}
  />
);

// Default redirect component
const DefaultRedirect = () => {
  const { currentUser, isAdmin, isCloud } = useAuth();
  
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  if (isAdmin) {
    return <Redirect to="/admin-dashboard" />;
  }
  
  if (isCloud) {
    return <Redirect to="/cloud-dashboard" />;
  }
  
  return <Redirect to="/challenges" />;
};

// Themed Toast Container
const ThemedToastContainer = () => {
  const { isDark } = useTheme();
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
    />
  );
};

// Themed Container
const ThemedContainer = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'}>
      {children}
    </div>
  );
};

// Notification Initializer Component
const NotificationInitializer = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (currentUser && notificationService.isSupported) {
          // Request permission and get token
          const token = await notificationService.requestPermission();
          
          if (token) {
            // Save token to database
            await notificationService.saveTokenToDatabase(token, currentUser.id);
            
            // Listen for foreground messages
            notificationService.onMessageListener();
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        // Don't show error to user as notifications are optional
      }
    };

    initializeNotifications();
  }, [currentUser]);

  return null; // This component doesn't render anything
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatProvider>
          <Router>
            <ThemedContainer>
              <div className="App">
                <OfflineNotification />
                <InstallPrompt />
                <NotificationInitializer />
                
                <Switch>
                  {/* Public routes */}
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Registration} />
                  <Route path="/admin-login" component={AdminLogin} />
                  <Route path="/cloud-login" component={CloudLogin} />
                  <Route path="/thank-you" component={ThankYouPage} />
                  <Route path="/offline" component={OfflinePage} />
                  
                  {/* Protected routes with navbar */}
                  <Route
                    path="/"
                    render={() => (
                      <div>
                        <Navbar />
                        <Switch>
                          {/* Default redirect */}
                          <Route exact path="/" component={DefaultRedirect} />
                          
                          {/* User routes */}
                          <ProtectedRoute
                            path="/challenges"
                            component={Challenges}
                            condition={true} // Any authenticated user can access
                          />
                          
                          {/* Support routes */}
                          <ProtectedRoute
                            path="/support"
                            component={SupportPage}
                            condition={true} // Any authenticated user can access
                          />
                          
                          {/* Admin routes */}
                          <ProtectedRoute
                            path="/admin-dashboard"
                            component={AdminDashboard}
                            condition={true} // Will be checked in component
                          />
                          
                          <ProtectedRoute
                            path="/level-manager"
                            component={LevelManager}
                            condition={true} // Will be checked in component
                          />
                          
                          <ProtectedRoute
                            path="/user-progress-manager"
                            component={UserProgressManager}
                            condition={true} // Will be checked in component
                          />
                          
                          {/* Cloud routes */}
                          <ProtectedRoute
                            path="/cloud-dashboard"
                            component={CloudDashboard}
                            condition={true} // Will be checked in component
                          />
                          
                          {/* Fallback redirect */}
                          <Route component={DefaultRedirect} />
                        </Switch>
                      </div>
                    )}
                  />
                </Switch>
                
                <ThemedToastContainer />
              </div>
            </ThemedContainer>
          </Router>
        </ChatProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;