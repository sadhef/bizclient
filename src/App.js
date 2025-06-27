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
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';

// Protected Route component for authentication
const ProtectedRoute = ({ component: Component, isAllowed, redirectPath = '/login', ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAllowed ? (
        <Component {...props} />
      ) : (
        <Redirect to={redirectPath} />
      )
    }
  />
);

// Cloud Protected Route component
const CloudProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser, isCloud } = useAuth();
  
  return (
    <Route
      {...rest}
      render={props =>
        currentUser && isCloud ? (
          <Component {...props} />
        ) : (
          <Redirect to="/cloud-login" />
        )
      }
    />
  );
};

// Admin Protected Route component
const AdminProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser, isAdmin } = useAuth();
  
  return (
    <Route
      {...rest}
      render={props =>
        currentUser && isAdmin ? (
          <Component {...props} />
        ) : (
          <Redirect to="/admin-login" />
        )
      }
    />
  );
};

// User Protected Route component
const UserProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser, isAdmin, isCloud } = useAuth();
  
  return (
    <Route
      {...rest}
      render={props =>
        currentUser && !isAdmin && !isCloud ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

// Theme-aware container component
const ThemedContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary text-light-primary dark:text-dark-primary">
      {children}
    </div>
  );
};

// Toast container with theme support
const ThemedToastContainer = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
};

// Default redirect component
const DefaultRedirect = () => {
  const { currentUser, isAdmin, isCloud } = useAuth();
  
  if (!currentUser) {
    return <Redirect to="/cloud-login" />;
  }
  
  if (isAdmin) {
    return <Redirect to="/admin-dashboard" />;
  }
  
  if (isCloud) {
    return <Redirect to="/cloud-dashboard" />;
  }
  
  return <Redirect to="/challenges" />;
};

// App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <ThemedContainer>
              <Navbar />
              <Switch>
                {/* Home route - always redirect to cloud login */}
                <Route exact path="/">
                  <Redirect to="/cloud-login" />
                </Route>
                
                {/* Public routes */}
                <Route path="/login" component={Login} />
                <Route path="/register" component={Registration} />
                <Route path="/admin-login" component={AdminLogin} />
                <Route path="/cloud-login" component={CloudLogin} />
                <Route path="/thank-you" component={ThankYouPage} />
                <Route path="/offline" component={OfflinePage} />
                
                {/* User protected routes */}
                <UserProtectedRoute path="/challenges" component={Challenges} />
                
                {/* Admin protected routes */}
                <AdminProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
                <AdminProtectedRoute path="/level-manager" component={LevelManager} />
                <AdminProtectedRoute path="/user-progress" component={UserProgressManager} />
                
                {/* Cloud protected routes */}
                <CloudProtectedRoute path="/cloud-dashboard" component={CloudDashboard} />
                <CloudProtectedRoute path="/support" component={SupportPage} />
                
                {/* Catch all route - redirect to appropriate dashboard based on user type */}
                <Route path="*" component={DefaultRedirect} />
              </Switch>
              
              {/* Global components */}
              <OfflineNotification />
              <InstallPrompt />
              <ThemedToastContainer />
            </ThemedContainer>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;