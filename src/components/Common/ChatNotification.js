import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

const ChatNotification = ({ onClick }) => {
  const { unreadCount } = useChat();
  const { isDark } = useTheme();
  
  const hasUnread = unreadCount > 0;
  
  return (
    <button
      onClick={onClick}
      className={`relative p-1 rounded-full flex items-center justify-center ${
        hasUnread
          ? isDark
            ? 'text-white bg-indigo-700 hover:bg-indigo-600'
            : 'text-white bg-indigo-600 hover:bg-indigo-500'
          : isDark
            ? 'text-indigo-300 hover:bg-gray-700'
            : 'text-indigo-600 hover:bg-gray-100'
      } transition-colors duration-200`}
      aria-label="Chat notifications"
    >
      <FiMessageCircle size={20} />
      
      {hasUnread && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatNotification;