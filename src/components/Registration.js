import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaBuilding, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

const Registration = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    institution: '',
    location: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.name);
      
      toast.success('Registration successful! Starting challenge...');
      history.push('/challenges');
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: 'name', icon: FaUser, type: 'text' },
    { name: 'email', icon: FaEnvelope, type: 'email' },
    { name: 'phone', icon: FaPhone, type: 'text' },
    { name: 'education', icon: FaGraduationCap, type: 'text' },
    { name: 'institution', icon: FaBuilding, type: 'text' },
    { name: 'location', icon: FaMapMarkerAlt, type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              alt="Biztras Logo"
              className="mx-auto h-24 w-auto mb-6 drop-shadow-xl rounded-2xl"
            />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-50 blur rounded-2xl" />
          </div>
          
          <h2 className="text-4xl font-bold text-violet-50 mb-2 tracking-tight">
            BIZTRAS CTF Challenge
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-violet-400 to-violet-600 mx-auto mb-4" />
          <p className="text-lg text-violet-200">Complete all levels within 1 hour</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-lg bg-violet-50/10 rounded-2xl shadow-2xl p-8 border border-violet-200/20 relative overflow-hidden">
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
            {inputFields.map(({ name, icon: Icon, type }) => (
              <div key={name} className="relative group">
                <label htmlFor={name} className="block text-sm font-medium text-violet-100 mb-2 capitalize">
                  {name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-violet-300 group-hover:text-violet-200 transition-colors duration-200" />
                  </div>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    required
                    value={formData[name]}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-violet-200/20 rounded-lg bg-violet-50/5 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-200 hover:bg-violet-50/10"
                    placeholder={`Enter your ${name}`}
                  />
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition duration-200 shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-violet-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-violet-50 rounded-full animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Start Challenge'
                  )}
                </span>
              </button>
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