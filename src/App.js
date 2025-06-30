import React from 'react';
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
  const { currentUser, isUser, isAdmin, isCloud } = useAuth();
  
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  if (isAdmin) {
    return <Redirect to="/admin-dashboard" />;
  }
  
  if (isCloud) {
    return <Redirect to="/cloud-dashboard" />;
  }
  
  if (isUser) {
    return <Redirect to="/challenges" />;
  }
  
  return <Redirect to="/login" />;
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
    <div className={isDark ? 'dark' : ''}>
      {children}
    </div>
  );
};

// Main App Content
const AppContent = () => {
  const { currentUser, isUser, isAdmin, isCloud, loading } = useAuth();
  
  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemedContainer>
      <Router>
        <ChatProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar - only show if user is logged in */}
            {currentUser && <Navbar />}
            
            <Switch>
              {/* Public routes */}
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Registration} />
              <Route exact path="/admin-login" component={AdminLogin} />
              <Route exact path="/cloud-login" component={CloudLogin} />
              <Route exact path="/offline" component={OfflinePage} />
              
              {/* Thank you page - accessible to all authenticated users */}
              <ProtectedRoute 
                exact 
                path="/thank-you" 
                component={ThankYouPage}
                condition={!!currentUser}
              />
              
              {/* User protected routes */}
              <ProtectedRoute 
                exact 
                path="/challenges" 
                component={Challenges}
                condition={currentUser && (isUser || isAdmin)}
                redirectPath="/login"
              />
              
              {/* Admin protected routes */}
              <ProtectedRoute 
                exact 
                path="/admin-dashboard" 
                component={AdminDashboard}
                condition={currentUser && isAdmin}
                redirectPath="/admin-login"
              />
              <ProtectedRoute 
                exact 
                path="/level-manager" 
                component={LevelManager}
                condition={currentUser && isAdmin}
                redirectPath="/admin-login"
              />
              <ProtectedRoute 
                exact 
                path="/level-manager/:id" 
                component={LevelManager}
                condition={currentUser && isAdmin}
                redirectPath="/admin-login"
              />
              <ProtectedRoute 
                exact 
                path="/user-progress/:userId" 
                component={UserProgressManager}
                condition={currentUser && isAdmin}
                redirectPath="/admin-login"
              />
              
              {/* Cloud protected routes */}
              <ProtectedRoute 
                exact 
                path="/cloud-dashboard" 
                component={CloudDashboard}
                condition={currentUser && (isCloud || isAdmin)}
                redirectPath="/cloud-login"
              />
              <ProtectedRoute 
                exact 
                path="/support" 
                component={SupportPage}
                condition={currentUser && (isCloud || isAdmin)}
                redirectPath="/cloud-login"
              />
              
              {/* Root redirect */}
              <Route exact path="/" component={DefaultRedirect} />
              
              {/* Catch all route - redirect to appropriate dashboard based on user type */}
              <Route path="*" component={DefaultRedirect} />
            </Switch>
            
            {/* Global components */}
            <OfflineNotification />
            <InstallPrompt />
            <ThemedToastContainer />
          </div>
        </ChatProvider>
      </Router>
    </ThemedContainer>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;