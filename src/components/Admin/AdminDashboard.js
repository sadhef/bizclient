import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../Common/LoadingSpinner';
import { 
  FaUsers, 
  FaTasks, 
  FaUserClock, 
  FaUserCheck, 
  FaChartLine,
  FaPlus,
  FaEdit,
  FaEye
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, pending: 0, approved: 0, rejected: 0 },
    challenges: { total: 0, active: 0, inactive: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentChallenges, setRecentChallenges] = useState([]);

  const { isDark } = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [usersResponse, challengesResponse] = await Promise.all([
        api.get('/users/stats'),
        api.get('/challenges/stats')
      ]);
      
      setStats({
        users: usersResponse.data.stats,
        challenges: challengesResponse.data.stats,
        recentActivity: []
      });
      
      // Fetch recent users and challenges
      const [recentUsersResponse, recentChallengesResponse] = await Promise.all([
        api.get('/users?limit=5'),
        api.get('/challenges?limit=5')
      ]);
      
      setRecentUsers(recentUsersResponse.data.users || []);
      setRecentChallenges(recentChallengesResponse.data.challenges || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: FaUsers,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Pending Approvals',
      value: stats.users.pending,
      icon: FaUserClock,
      color: 'bg-yellow-500',
      link: '/admin/users?filter=pending'
    },
    {
      title: 'Approved Users',
      value: stats.users.approved,
      icon: FaUserCheck,
      color: 'bg-green-500',
      link: '/admin/users?filter=approved'
    },
    {
      title: 'Total Challenges',
      value: stats.challenges.total,
      icon: FaTasks,
      color: 'bg-purple-500',
      link: '/admin/challenges'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Admin Dashboard
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.color} mr-4`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent User Registrations
              </h2>
              <Link 
                to="/admin/users"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No recent registrations
                </p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaUsers className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : user.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Challenges */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Challenges
              </h2>
              <Link 
                to="/admin/challenges"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentChallenges.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No challenges created yet
                </p>
              ) : (
                recentChallenges.map((challenge) => (
                  <div key={challenge._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaTasks className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {challenge.title}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {challenge.difficulty} • {challenge.points} points
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      challenge.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {challenge.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className={`${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-4 rounded-lg shadow border-2 border-transparent hover:border-blue-500 transition-all duration-200`}
            >
              <div className="flex items-center">
                <FaUsers className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manage Users
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Approve, reject, or manage user accounts
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/challenges"
              className={`${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-4 rounded-lg shadow border-2 border-transparent hover:border-purple-500 transition-all duration-200`}
            >
              <div className="flex items-center">
                <FaTasks className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manage Challenges
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create, edit, or delete challenges
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className={`${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-4 rounded-lg shadow border-2 border-transparent hover:border-green-500 transition-all duration-200`}
            >
              <div className="flex items-center">
                <FaChartLine className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    View Analytics
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Platform statistics and reports
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;