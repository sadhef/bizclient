import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const history = useHistory();
  const { adminLogin, currentUser, isAdmin, loading } = useAuth();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && isAdmin) {
      setTimeout(() => {
        history.push('/admin-dashboard');
      }, 0);
    }
  }, [currentUser, isAdmin, history]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError('');
      const user = await adminLogin(credentials.email, credentials.password);
      toast.success('Admin login successful!');
      localStorage.setItem('isAdmin', 'true');
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 100);
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
      toast.error(err.message || 'Invalid admin credentials');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-violet-50 w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-violet-50 w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      <div className="max-w-md mx-auto relative">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src="/biztras.png"
              alt="Admin Logo"
              className="mx-auto h-24 w-auto mb-6 drop-shadow-xl rounded-2xl"
            />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-50 blur rounded-2xl" />
          </div>
          <h2 className="text-4xl font-bold text-violet-50 mb-2 tracking-tight">Admin Login</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-violet-400 to-violet-600 mx-auto mb-4" />
        </div>

        <div className="backdrop-blur-lg bg-violet-50/10 rounded-2xl shadow-2xl p-8 border border-violet-200/20 relative overflow-hidden">
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <label className="block text-sm font-medium text-violet-100 mb-2">Email <span className="text-red-300">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-violet-300 group-hover:text-violet-200 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-violet-200/20 rounded-lg bg-violet-50/5 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-200 hover:bg-violet-50/10"
                  placeholder="Enter admin email"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-violet-100 mb-2">Password <span className="text-red-300">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-violet-300 group-hover:text-violet-200 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-violet-200/20 rounded-lg bg-violet-50/5 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-200 hover:bg-violet-50/10"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition duration-200 shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-violet-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  {formLoading || loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-violet-50 rounded-full animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-2" />
                      Admin Login
                    </>
                  )}
                </span>
              </button>
            </div>

            <div className="text-center text-sm text-violet-200 mt-4">
              <a href="/" className="text-violet-300 hover:text-white font-medium">
                Back to Home
              </a>
            </div>
          </form>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default AdminLogin;