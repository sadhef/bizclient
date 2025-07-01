import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { FaUsers, FaTasks, FaChartLine, FaClock } from 'react-icons/fa';

const AdminStats = () => {
  const [stats, setStats] = useState({
    users: { total: 0, pending: 0, approved: 0 },
    challenges: { total: 0, active: 0 },
    activity: { weeklyRegistrations: 0, challengeCompletions: 0 }
  });
  const [loading, setLoading] = useState(true);

  const { isDark } = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, challengesRes, activityRes] = await Promise.all([
        api.get('/admin/stats/users'),
        api.get('/admin/stats/challenges'),
        api.get('/admin/stats/activity')
      ]);

      setStats({
        users: usersRes.data,
        challenges: challengesRes.data,
        activity: activityRes.data
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      change: `+${stats.activity.weeklyRegistrations} this week`,
      icon: FaUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Approvals',
      value: stats.users.pending,
      urgent: stats.users.pending > 0,
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Active Challenges',
      value: stats.challenges.active,
      total: stats.challenges.total,
      icon: FaTasks,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Weekly Completions',
      value: stats.activity.challengeCompletions,
      icon: FaChartLine,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow animate-pulse`}>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-300 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg relative overflow-hidden`}>
          {card.urgent && (
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          )}
          
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${card.bgColor} mr-4`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {card.value}
                {card.total && (
                  <span className="text-sm font-normal text-gray-500">
                    /{card.total}
                  </span>
                )}
              </p>
              {card.change && (
                <p className="text-xs text-green-600 mt-1">
                  {card.change}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;