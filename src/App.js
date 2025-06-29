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
const ProtectedRoute = ({ component: Component, allowedRoles = [], ...rest }) => {
  const { currentUser, isAdmin, isCloud } = useAuth();
  
  return (
    <Route
      {...rest}
      render={props => {
        if (!currentUser) {
          return <Redirect to="/login" />;
        }
        
        // Check role-based access
        if (allowedRoles.length > 0) {
          const userRoles = [];
          if (isAdmin) userRoles.push('admin');
          if (isCloud) userRoles.push('cloud');
          if (!isAdmin && !isCloud) userRoles.push('user');
          
          const hasAccess = allowedRoles.some(role => userRoles.includes(role));
          if (!hasAccess) {
            return <Redirect to="/login" />;
          }
        }
        
        return <Component {...props} />;
      }}
    />
  );
};

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
      toastClassName="bg-gray-800 text-white border border-gray-700"
      bodyClassName="text-gray-100"
      progressClassName="bg-primary"
    />
  );
};

// Themed Container
const ThemedContainer = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark bg-dark min-h-screen text-white' : 'bg-gray-50 min-h-screen text-gray-900'}>
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatProvider>
          <Router>
            <ThemedContainer>
              <div className="App">
                <Navbar />
                <OfflineNotification />
                <InstallPrompt />
                
                <Switch>
                  {/* Public Routes */}
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/register" component={Registration} />
                  <Route exact path="/admin-login" component={AdminLogin} />
                  <Route exact path="/cloud-login" component={CloudLogin} />
                  <Route exact path="/support" component={SupportPage} />
                  <Route exact path="/offline" component={OfflinePage} />
                  <Route exact path="/thank-you" component={ThankYouPage} />
                  
                  {/* Protected Routes */}
                  <ProtectedRoute
                    exact
                    path="/challenges"
                    component={Challenges}
                    allowedRoles={['user']}
                  />
                  
                  <ProtectedRoute
                    exact
                    path="/admin-dashboard"
                    component={AdminDashboard}
                    allowedRoles={['admin']}
                  />
                  
                  <ProtectedRoute
                    exact
                    path="/admin/levels"
                    component={LevelManager}
                    allowedRoles={['admin']}
                  />
                  
                  <ProtectedRoute
                    exact
                    path="/admin/progress"
                    component={UserProgressManager}
                    allowedRoles={['admin']}
                  />
                  
                  <ProtectedRoute
                    exact
                    path="/cloud-dashboard"
                    component={CloudDashboard}
                    allowedRoles={['cloud']}
                  />
                  
                  {/* Default Route */}
                  <Route exact path="/" component={DefaultRedirect} />
                  
                  {/* 404 Route */}
                  <Route path="*" render={() => <Redirect to="/" />} />
                </Switch>
                
                {/* Toast Container for notifications */}
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