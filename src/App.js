import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ChallengeList from './pages/Challenge/ChallengeList';
import ChallengePage from './pages/Challenge/ChallengePage';
import ThankYouPage from './pages/Challenge/ThankYouPage';
import Profile from './pages/User/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, approvedOnly = false, excludeAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Exclude admin from certain routes
  if (excludeAdmin && user.isAdmin) {
    return <Redirect to="/admin" />;
  }

  if (approvedOnly && !user.isApproved && !user.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return user.isAdmin ? <Redirect to="/admin" /> : <Redirect to="/dashboard" />;
  }

  return children;
};

// Layout wrapper for authenticated pages that need padding from navbar
const AuthenticatedLayout = ({ children }) => {
  return (
    <main className="pt-16">
      {children}
    </main>
  );
};

// Layout wrapper for pages that handle their own spacing (like homepage)
const PublicLayout = ({ children }) => {
  return children;
};

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary transition-colors duration-200">
      {/* Navbar is always visible */}
      <Navbar />
      
      <Switch>
        {/* Public Homepage Route */}
        <Route exact path="/">
          {user ? (
            user.isAdmin ? <Redirect to="/admin" /> : <Redirect to="/dashboard" />
          ) : (
            <PublicLayout>
              <Homepage />
            </PublicLayout>
          )}
        </Route>

        {/* Public Auth Routes */}
        <Route path="/login">
          <PublicRoute>
            <PublicLayout>
              <Login />
            </PublicLayout>
          </PublicRoute>
        </Route>
        
        <Route path="/register">
          <PublicRoute>
            <PublicLayout>
              <Register />
            </PublicLayout>
          </PublicRoute>
        </Route>

        {/* Admin Only Routes */}
        <Route path="/admin">
          <ProtectedRoute adminOnly>
            <AuthenticatedLayout>
              <AdminDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        {/* User Only Routes (Exclude Admin) */}
        <Route path="/dashboard">
          <ProtectedRoute excludeAdmin>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/challenges">
          <ProtectedRoute approvedOnly excludeAdmin>
            <AuthenticatedLayout>
              <ChallengeList />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/challenge">
          <ProtectedRoute approvedOnly excludeAdmin>
            <AuthenticatedLayout>
              <ChallengePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/profile">
          <ProtectedRoute excludeAdmin>
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/thank-you">
          <ProtectedRoute excludeAdmin>
            <AuthenticatedLayout>
              <ThankYouPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        </Route>

        {/* 404 Route */}
        <Route path="*">
          <AuthenticatedLayout>
            <NotFound />
          </AuthenticatedLayout>
        </Route>
      </Switch>

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
        className="z-50"
      />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;