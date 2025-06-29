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

// Notification Initializer Component - Non-intrusive
const NotificationInitializer = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (currentUser && notificationService.isSupported) {
          // Initialize gracefully without forcing permission request
          const result = await notificationService.initializeGracefully(currentUser);
          
          if (result.success) {
            console.log('Notifications initialized successfully');
          } else {
            console.log('Notifications not initialized:', result.reason);
            // This is fine - notifications are optional
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        // Don't show error to user as notifications are optional
      }
    };

    // Only initialize if user is logged in
    if (currentUser) {
      initializeNotifications();
    }
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
                
                <AppRoutes />
                
                <Navbar />
                <ThemedToastContainer />
              </div>
            </ThemedContainer>
          </Router>
        </ChatProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Separate component for routes to access auth context
const AppRoutes = () => {
  const { currentUser, isAdmin, isCloud } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Registration} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/cloud-login" component={CloudLogin} />
      <Route path="/support" component={SupportPage} />
      <Route path="/offline" component={OfflinePage} />
      
      {/* Protected Routes */}
      <ProtectedRoute 
        path="/challenges" 
        component={Challenges} 
        condition={!!currentUser && !isAdmin && !isCloud}
      />
      
      <ProtectedRoute 
        path="/thank-you" 
        component={ThankYouPage} 
        condition={!!currentUser}
      />
      
      {/* Admin Routes */}
      <ProtectedRoute 
        path="/admin-dashboard" 
        component={AdminDashboard} 
        condition={!!currentUser && isAdmin}
        redirectPath="/admin-login"
      />
      
      <ProtectedRoute 
        path="/level-manager" 
        component={LevelManager} 
        condition={!!currentUser && isAdmin}
        redirectPath="/admin-login"
      />
      
      <ProtectedRoute 
        path="/user-progress" 
        component={UserProgressManager} 
        condition={!!currentUser && isAdmin}
        redirectPath="/admin-login"
      />
      
      {/* Cloud Routes */}
      <ProtectedRoute 
        path="/cloud-dashboard" 
        component={CloudDashboard} 
        condition={!!currentUser && isCloud}
        redirectPath="/cloud-login"
      />
      
      {/* Default redirect */}
      <Route exact path="/" component={DefaultRedirect} />
      
      {/* 404 fallback */}
      <Route path="*" render={() => <Redirect to="/" />} />
    </Switch>
  );
};

export default App;