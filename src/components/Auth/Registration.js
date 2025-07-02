import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaBuilding, 
  FaMapMarkerAlt,
  FaLock,
  FaUserPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Registration = () => {
  const history = useHistory();
  const { register, currentUser, loading } = useAuth();
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    education: '',
    institution: '',
    location: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      history.push('/challenges');
    }
  }, [currentUser, history]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormLoading(true);
      await register(formData);
      toast.success('Registration successful! Please login to continue.');
      history.push('/login');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const inputFields = [
    { name: 'name', icon: FaUser, type: 'text', required: true },
    { name: 'email', icon: FaEnvelope, type: 'email', required: true },
    { name: 'password', icon: FaLock, type: 'password', required: true },
    { name: 'phone', icon: FaPhone, type: 'text', required: false },
    { name: 'education', icon: FaGraduationCap, type: 'text', required: false },
    { name: 'institution', icon: FaBuilding, type: 'text', required: true },
    { name: 'location', icon: FaMapMarkerAlt, type: 'text', required: false },
  ];

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-violet-900' 
        : 'bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900'
    } py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-violet-50 w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-violet-50 w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src="/biztras.png"
              alt="CTF Logo"
              className="mx-auto h-24 w-auto mb-6 drop-shadow-xl rounded-2xl"
            />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-50 blur rounded-2xl" />
          </div>
          
          <h2 className="text-4xl font-bold text-violet-50 mb-2 tracking-tight">
            BizTras Account Registration
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-violet-400 to-violet-600 mx-auto mb-4" />
          <p className="text-lg text-violet-200">Register & Start the Account</p>
        </div>

        {/* Form Card */}
        <div className={`backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-violet-50/10 border-violet-200/20'
        } rounded-2xl shadow-2xl p-8 border relative overflow-hidden`}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            {inputFields.map(({ name, icon: Icon, type, required }) => (
              <div key={name} className="relative group">
                <label htmlFor={name} className="block text-sm font-medium text-violet-100 mb-2 capitalize">
                  {name} {required && <span className="text-red-300">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-violet-300 group-hover:text-violet-200 transition-colors duration-200" />
                  </div>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    required={required}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70' 
                        : 'bg-violet-50/5 border-violet-200/20 hover:bg-violet-50/10'
                    }`}
                    placeholder={`Enter your ${name}`}
                  />
                </div>
              </div>
            ))}

            {/* Submit Button */}
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Register
                    </>
                  )}
                </span>
              </button>
            </div>
            
            {/* Login Link */}
            <div className="text-center text-sm text-violet-200 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-300 hover:text-white font-medium">
                Login here
              </Link>
            </div>
          </form>
        </div>

        {/* Decorative bottom element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default Registration;