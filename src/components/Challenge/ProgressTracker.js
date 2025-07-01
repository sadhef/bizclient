import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaTrophy, FaClock, FaFire, FaTarget } from 'react-icons/fa';

const ProgressTracker = ({ stats }) => {
  const { isDark } = useTheme();

  const progressCards = [
    {
      title: 'Completed',
      value: stats.completed || 0,
      total: stats.total || 0,
      icon: FaTrophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'In Progress',
      value: stats.inProgress || 0,
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Points',
      value: stats.totalPoints || 0,
      icon: FaFire,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Success Rate',
      value: `${stats.completionRate?.toFixed(1) || 0}%`,
      icon: FaTarget,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {progressCards.map((card, index) => (
        <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${card.bgColor} mr-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {card.title}
              </p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {card.value}
                {card.total && <span className="text-sm font-normal">/{card.total}</span>}
              </p>
            </div>
          </div>
          
          {card.total && (
            <div className="mt-3">
              <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((card.value / card.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;