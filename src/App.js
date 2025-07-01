import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import PendingApproval from './components/Auth/PendingApproval';

// User components
import ChallengeComponent from './components/Challenge/ChallengeComponent';
import ThankYouPage from './components/Challenge/ThankYouPage';
import UserProfile from './components/User/UserProfile';

// Admin components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AdminChallengeManager from './components/Admin/AdminChallengeManager';

// Common components
import Navbar from './components/Common/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import OfflineNotification from './components/Common/OfflineNotification';
import InstallPrompt from './components/Common/InstallPrompt';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Protected Route component
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

// Default redirect logic
const DefaultRedirect = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  if (isAdmin) {
    return <Redirect to="/admin" />;
  }
  
  if (currentUser.status === 'pending') {
    return <Redirect to="/pending-approval" />;
  }
  
  if (currentUser.status === 'approved') {
    return <Redirect to="/challenges" />;
  }
  
  if (currentUser.status === 'rejected' || currentUser.status === 'suspended') {
    return <Redirect to="/unauthorized" />;
  }
  
  return <Redirect to="/login" />;
};

// Unauthorized Access Component
const UnauthorizedPage = () => {
  const { isDark } = useTheme();
  const { logout } = useAuth();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Access Denied
        </h1>
        
        <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Your account status doesn't allow access to this resource. Please contact an administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={logout}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Return to Login
          </button>
          
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Need help? Contact support at support@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Content Component
const AppContent = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingSpinner text="Initializing application..." />;
  }

  return (
    <div className={isDark ? 'dark bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <Router>
        <ErrorBoundary>
          {/* Show navbar only for logged in users */}
          {currentUser && <Navbar />}
          
          <Switch>
            {/* Public Routes - Only accessible when NOT logged in */}
            <Route 
              exact 
              path="/login" 
              render={() => currentUser ? <DefaultRedirect /> : <Login />}
            />
            <Route 
              exact 
              path="/register" 
              render={() => currentUser ? <DefaultRedirect /> : <Registration />}
            />
            
            {/* Pending Approval Route */}
            <ProtectedRoute
              exact
              path="/pending-approval"
              component={PendingApproval}
              condition={currentUser && currentUser.status === 'pending'}
              redirectPath="/login"
            />
            
            {/* Main Challenge Route - Approved users only */}
            <ProtectedRoute
              exact
              path="/challenges"
              component={ChallengeComponent}
              condition={currentUser && currentUser.status === 'approved' && !isAdmin}
              redirectPath="/login"
            />
            
            {/* Thank You Results Page */}
            <ProtectedRoute
              exact
              path="/thank-you"
              component={ThankYouPage}
              condition={currentUser && currentUser.status === 'approved' && !isAdmin}
              redirectPath="/login"
            />
            
            {/* User Profile */}
            <ProtectedRoute
              exact
              path="/profile"
              component={UserProfile}
              condition={currentUser && currentUser.status === 'approved'}
              redirectPath="/login"
            />
            
            {/* Admin Routes */}
            <ProtectedRoute
              exact
              path="/admin"
              component={AdminDashboard}
              condition={currentUser && isAdmin}
              redirectPath="/login"
            />
            <ProtectedRoute
              exact
              path="/admin/users"
              component={UserManagement}
              condition={currentUser && isAdmin}
              redirectPath="/login"
            />
            <ProtectedRoute
              exact
              path="/admin/challenges"
              component={AdminChallengeManager}
              condition={currentUser && isAdmin}
              redirectPath="/login"
            />
            
            {/* Unauthorized Access Route */}
            <Route 
              exact 
              path="/unauthorized" 
              component={UnauthorizedPage}
            />
            
            {/* Default Route - Redirect based on user status */}
            <Route exact path="/" component={DefaultRedirect} />
            
            {/* Catch all route - Redirect to appropriate page */}
            <Route path="*" component={DefaultRedirect} />
          </Switch>
          
          {/* Global Components */}
          <OfflineNotification />
          <InstallPrompt />
          
          {/* Toast Notifications */}
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
            toastStyle={{
              backgroundColor: isDark ? '#374151' : '#ffffff',
              color: isDark ? '#f3f4f6' : '#1f2937'
            }}
          />
        </ErrorBoundary>
      </Router>
    </div>
  );
};

// Main App Component
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