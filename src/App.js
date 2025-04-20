import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import AdminLogin from './components/Admin/AdminLogin';
import CloudLogin from './components/Cloud/CloudLogin';

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
import { AuthProvider } from './context/AuthContext';
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
                {/* Home route - always redirect to login */}
                <Route exact path="/">
                  <Redirect to="/login" />
                </Route>
                
                {/* Public routes */}
                <Route path="/login" component={Login} />
                <Route path="/register" component={Registration} />
                <Route path="/admin-login" component={AdminLogin} />
                <Route path="/cloud-login" component={CloudLogin} />
                <Route path="/thank-you" component={ThankYouPage} />
                <Route path="/offline" component={OfflinePage} />
                
                {/* User routes - Protected */}
                <ProtectedRoute 
                  path="/challenges" 
                  component={Challenges}
                  isAllowed={props => props.currentUser}
                />
                
                <ProtectedRoute 
                  path="/support" 
                  component={SupportPage}
                  isAllowed={props => props.currentUser}
                />
                
                {/* Admin routes - Protected, admin only */}
                <ProtectedRoute 
                  path="/admin-dashboard" 
                  component={AdminDashboard}
                  isAllowed={props => props.currentUser && props.isAdmin}
                  redirectPath="/admin-login"
                />
                <ProtectedRoute 
                  path="/admin/challenges/new" 
                  component={LevelManager}
                  isAllowed={props => props.currentUser && props.isAdmin}
                  redirectPath="/admin-login"
                />
                <ProtectedRoute 
                  path="/admin/challenges/edit/:id" 
                  component={LevelManager}
                  isAllowed={props => props.currentUser && props.isAdmin}
                  redirectPath="/admin-login"
                />
                <ProtectedRoute 
                  path="/admin/progress/:userId" 
                  component={UserProgressManager}
                  isAllowed={props => props.currentUser && props.isAdmin}
                  redirectPath="/admin-login"
                />
                
                {/* Cloud Dashboard - Protected, cloud users only */}
                <ProtectedRoute
                  path="/cloud-dashboard"
                  component={CloudDashboard}
                  isAllowed={props => props.currentUser && props.isCloud}
                  redirectPath="/cloud-login"
                />
                
                {/* Fallback route - redirect to login */}
                <Route path="*">
                  <Redirect to="/login" />
                </Route>
              </Switch>
              
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