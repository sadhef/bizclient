import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Registration from './components/Registration';
import Challenges from './components/Challenges';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ThankYouPage from './components/ThankYouPage';

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAdmin = localStorage.getItem('isAdmin');
  
  return (
    <Route
      {...rest}
      render={props =>
        isAdmin ? (
          <Component {...props} />
        ) : (
          <Redirect to="/faheembiz" />
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Switch>
          <Route exact path="/" component={Registration} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/faheembiz" component={AdminLogin} />
          <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/thank-you" component={ThankYouPage} />
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
        />
      </div>
    </Router>
  );
}

export default App;