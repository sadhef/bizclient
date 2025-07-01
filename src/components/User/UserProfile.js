import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUniversity, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    institution: '',
    location: '',
    bio: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});

  const { currentUser, updateUser } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (currentUser) {
      const userProfile = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        education: currentUser.education || '',
        institution: currentUser.institution || '',
        location: currentUser.location || '',
        bio: currentUser.bio || ''
      };
      setProfile(userProfile);
      setOriginalProfile(userProfile);
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.patch('/users/profile', profile);
      
      updateUser(response.data.user);
      setOriginalProfile(profile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const profileFields = [
    { name: 'name', label: 'Full Name', icon: FaUser, type: 'text' },
    { name: 'email', label: 'Email Address', icon: FaEnvelope, type: 'email', disabled: true },
    { name: 'phone', label: 'Phone Number', icon: FaPhone, type: 'tel' },
    { name: 'education', label: 'Education Level', icon: FaGraduationCap, type: 'text' },
    { name: 'institution', label: 'Institution/College', icon: FaUniversity, type: 'text' },
    { name: 'location', label: 'Location/City', icon: FaMapMarkerAlt, type: 'text' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                My Profile
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your personal information
              </p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <FaEdit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center disabled:opacity-50"
                >
                  <FaSave className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                >
                  <FaTimes className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Status */}
          <div className="lg:col-span-1">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="text-center">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="h-12 w-12 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {profile.name}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {profile.email}
                </p>
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  {currentUser?.status === 'approved' ? 'Approved User' : currentUser?.status}
                </span>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Member since:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                    {new Date(currentUser?.registrationTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Last login:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                    {currentUser?.lastLogin 
                      ? new Date(currentUser.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileFields.map(({ name, label, icon: Icon, type, disabled }) => (
                  <div key={name}>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={type}
                        name={name}
                        value={profile[name]}
                        onChange={handleChange}
                        disabled={disabled || !editing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          disabled || !editing
                            ? isDark 
                              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                            : isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio Section */}
              <div className="mt-6">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !editing
                      ? isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;