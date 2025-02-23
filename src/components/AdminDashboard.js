import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiRefreshCcw, FiLogOut, FiClock } from 'react-icons/fi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [ctfProgress, setCtfProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const history = useHistory();

  const fetchData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

      const [regsResponse, progressResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/get-registrations`),
        fetch(`${apiBaseUrl}/get-progress`)
      ]);

      if (!regsResponse.ok || !progressResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [registrationsData, progressData] = await Promise.all([
        regsResponse.json(),
        progressResponse.json()
      ]);

      setUsers(registrationsData);
      setCtfProgress(progressData);
      
      if (showToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      toast.error('Please login first');
      history.push('/faheembiz');
      return;
    }

    fetchData();
  }, [fetchData, history]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    toast.success('Logged out successfully');
    history.push('/faheembiz');
  };

  const handleDelete = async (email) => {
    if (deleteConfirm !== email) {
      setDeleteConfirm(email);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/delete-user/${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(prev => prev.filter(user => user.email !== email));
      setCtfProgress(prev => prev.filter(progress => progress.userEmail !== email));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressStatus = useCallback((email) => {
    const progress = ctfProgress.find(p => p.userEmail === email);
    if (!progress) return { status: Array(4).fill('Not Started'), timeRemaining: null };

    return {
      status: [1, 2, 3, 4].map(level => {
        if (progress.levelStatus && progress.levelStatus[level]) return 'Completed';
        if (progress.flagsEntered && progress.flagsEntered[level]) return 'Attempted';
        return 'Not Started';
      }),
      timeRemaining: progress.timeRemaining
    };
  }, [ctfProgress]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 font-medium';
      case 'Attempted': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiRefreshCcw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Participants</h2>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Total: {users.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level 1
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level 2
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level 3
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level 4
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const { status, timeRemaining } = getProgressStatus(user.email);
                  return (<tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.institution}</div>
                    </td>
                    {status.map((levelStatus, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm ${getStatusColor(levelStatus)}`}>
                          {levelStatus}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <FiClock className="mr-1 text-gray-500" />
                        <span className={`text-sm ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-500'}`}>
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDelete(user.email)}
                        disabled={loading}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                          deleteConfirm === user.email
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        <FiTrash2 className="mr-1" />
                        {deleteConfirm === user.email ? 'Confirm' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No participants registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;