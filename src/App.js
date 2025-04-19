import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import AdminLogin from './components/Admin/AdminLogin';

// Challenge components
import Challenges from './components/Challenge/Challenges';
import ThankYouPage from './components/Common/ThankYouPage';
// Admin components
import AdminDashboard from './components/Admin/AdminDashboard';
import LevelManager from './components/Admin/LevelManager';
import UserProgressManager from './components/Admin/UserProgressManager';
import Navbar from './components/Common/Navbar';
import OfflineNotification from './components/Common/OfflineNotification';
import InstallPrompt from './components/Common/InstallPrompt';
import OfflinePage from './components/Common/OfflinePage';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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

// Simple App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
              <Route path="/thank-you" component={ThankYouPage} />
              <Route path="/offline" component={OfflinePage} />
              
              {/* User routes - authentication check is inside the component */}
              <Route path="/challenges" component={Challenges} />
              
              {/* Admin routes - authentication check is inside the component */}
              <Route path="/admin-dashboard" component={AdminDashboard} />
              <Route path="/admin/challenges/new" component={LevelManager} />
              <Route path="/admin/challenges/edit/:id" component={LevelManager} />
              <Route path="/admin/progress/:userId" component={UserProgressManager} />
              
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;