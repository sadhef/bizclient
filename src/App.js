import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/UX/LoadingSpinner';

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

  // NEW: Exclude admin from certain routes
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

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary transition-colors duration-200">
      <Navbar />
      
      <main className="pt-16">
        <Switch>
          {/* Homepage Route */}
          <Route exact path="/">
            <PublicRoute>
              <Homepage />
            </PublicRoute>
          </Route>

          {/* Public Routes */}
          <Route path="/login">
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Route>
          
          <Route path="/register">
            <PublicRoute>
              <Register />
            </PublicRoute>
          </Route>

          {/* Admin Only Routes */}
          <Route path="/admin">
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>

          {/* User Only Routes (Exclude Admin) */}
          <Route path="/dashboard">
            <ProtectedRoute excludeAdmin>
              <Dashboard />
            </ProtectedRoute>
          </Route>

          <Route path="/challenges">
            <ProtectedRoute approvedOnly excludeAdmin>
              <ChallengeList />
            </ProtectedRoute>
          </Route>

          <Route path="/challenge">
            <ProtectedRoute approvedOnly excludeAdmin>
              <ChallengePage />
            </ProtectedRoute>
          </Route>

          <Route path="/profile">
            <ProtectedRoute excludeAdmin>
              <Profile />
            </ProtectedRoute>
          </Route>

          <Route path="/thank-you">
            <ProtectedRoute excludeAdmin>
              <ThankYouPage />
            </ProtectedRoute>
          </Route>

          {/* 404 Route */}
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </main>

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