import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

// Create chat context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => {
  return useContext(ChatContext);
};

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastFetched, setLastFetched] = useState(null);
  
  const { currentUser } = useAuth();

  // Fetch chat messages
  const fetchMessages = async (showLoading = true) => {
    if (!currentUser) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await api.get('/chat/messages');
      
      if (response && response.messages) {
        setChatMessages(response.messages);
        setUnreadCount(0); // Reset unread count when explicitly fetching
        setLastFetched(new Date());
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError('Failed to load chat messages');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch online users
  const fetchOnlineUsers = async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.get('/chat/users/online');
      
      if (response && response.users) {
        setOnlineUsers(response.users);
      }
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  };

  // Send a new message
  const sendMessage = async (messageText) => {
    if (!currentUser || !messageText.trim()) return null;
    
    try {
      const response = await api.post('/chat/messages', {
        text: messageText
      });
      
      if (response && response.message) {
        // Add new message to the state
        setChatMessages(prev => [...prev, response.message]);
        return response.message;
      }
      return null;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };

  // Delete a message (admin only)
  const deleteMessage = async (messageId) => {
    if (!currentUser || !messageId) return false;
    
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      
      if (response && response.status === 'success') {
        // Remove message from state
        setChatMessages(prev => prev.filter(msg => msg._id !== messageId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
      return false;
    }
  };

  // Poll for new messages
  const checkNewMessages = async () => {
    if (!currentUser || !lastFetched) return;
    
    try {
      const response = await api.get(`/chat/messages/new?since=${lastFetched.toISOString()}`);
      
      if (response && response.messages && response.messages.length > 0) {
        setChatMessages(prev => [...prev, ...response.messages]);
        setUnreadCount(prev => prev + response.messages.length);
        setLastFetched(new Date());
      }
    } catch (err) {
      console.error('Error checking for new messages:', err);
    }
  };

  // Init chat data
  useEffect(() => {
    if (currentUser) {
      fetchMessages();
      fetchOnlineUsers();
      
      // Set up polling for new messages and online users
      const messageInterval = setInterval(checkNewMessages, 10000); // Check every 10 seconds
      const userInterval = setInterval(fetchOnlineUsers, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(messageInterval);
        clearInterval(userInterval);
      };
    }
  }, [currentUser]);

  // Reset state when user changes
  useEffect(() => {
    if (!currentUser) {
      setChatMessages([]);
      setOnlineUsers([]);
      setUnreadCount(0);
      setLastFetched(null);
    }
  }, [currentUser]);

  // Mark all messages as read
  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  // Value to be provided to consumers
  const value = {
    chatMessages,
    onlineUsers,
    loading,
    error,
    unreadCount,
    fetchMessages,
    fetchOnlineUsers,
    sendMessage,
    markAllAsRead,
    deleteMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;