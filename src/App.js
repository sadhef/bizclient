import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import PendingApproval from './components/Auth/PendingApproval';

// User components
import Challenges from './components/Challenge/Challenges';
import ChallengeDetails from './components/Challenge/ChallengeDetails';
import UserProfile from './components/User/UserProfile';

// Admin components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import ChallengeManager from './components/Admin/ChallengeManager';

// Common components
import Navbar from './components/Common/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChallengeProvider } from './context/ChallengeContext';

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
    return <Redirect to="/dashboard" />;
  }
  
  if (currentUser.status === 'rejected' || currentUser.status === 'suspended') {
    return <Redirect to="/unauthorized" />;
  }
  
  return <Redirect to="/login" />;
};

const AppContent = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={isDark ? 'dark bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <Router>
        <ErrorBoundary>
          <ChallengeProvider>
            {currentUser && <Navbar />}
            
            <Switch>
              {/* Public Routes */}
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
              
              {/* Pending Approval */}
              <ProtectedRoute
                exact
                path="/pending-approval"
                component={PendingApproval}
                condition={currentUser && currentUser.status === 'pending'}
                redirectPath="/login"
              />
              
              {/* User Routes (Approved users only) */}
              <ProtectedRoute
                exact
                path="/dashboard"
                component={Challenges}
                condition={currentUser && currentUser.status === 'approved' && !isAdmin}
                redirectPath="/login"
              />
              <ProtectedRoute
                exact
                path="/challenges"
                component={Challenges}
                condition={currentUser && currentUser.status === 'approved' && !isAdmin}
                redirectPath="/login"
              />
              <ProtectedRoute
                exact
                path="/challenge/:id"
                component={ChallengeDetails}
                condition={currentUser && currentUser.status === 'approved' && !isAdmin}
                redirectPath="/login"
              />
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
                component={ChallengeManager}
                condition={currentUser && isAdmin}
                redirectPath="/login"
              />
              
              {/* Default Route */}
              <Route exact path="/" component={DefaultRedirect} />
              
              {/* Unauthorized Access */}
              <Route 
                exact 
                path="/unauthorized" 
                render={() => (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
                      <p className="text-gray-600 mb-8">Your account status doesn't allow access to this resource.</p>
                      <button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Go to Login
                      </button>
                    </div>
                  </div>
                )}
              />
              
              {/* Catch all route */}
              <Route path="*" component={DefaultRedirect} />
            </Switch>
            
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
          </ChallengeProvider>
        </ErrorBoundary>
      </Router>
    </div>
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