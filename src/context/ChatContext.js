import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
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
  const [isSending, setIsSending] = useState(false);
  
  // Refs to store active intervals and track processed messages
  const messagePollingRef = useRef(null);
  const userPollingRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const recentlySentMessagesRef = useRef(new Set());
  
  const { currentUser } = useAuth();

  // Helper function to deduplicate messages
  const deduplicateMessages = useCallback((messages) => {
    const uniqueMessages = [];
    const seenIds = new Set();
    
    for (const message of messages) {
      if (message._id && !seenIds.has(message._id)) {
        seenIds.add(message._id);
        uniqueMessages.push(message);
      } else if (!message._id) {
        // If no ID, check for duplicate content by user + text + time
        const msgKey = `${message.userId}-${message.text}-${message.createdAt}`;
        if (!seenIds.has(msgKey)) {
          seenIds.add(msgKey);
          uniqueMessages.push(message);
        }
      }
    }
    
    return uniqueMessages;
  }, []);

  // Fetch chat messages with deduplication
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (!currentUser) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await api.get('/chat/messages');
      
      if (response && response.messages) {
        // Deduplicate messages before setting state
        const uniqueMessages = deduplicateMessages(response.messages);
        setChatMessages(uniqueMessages);
        setUnreadCount(0);
        setLastFetched(new Date());
        
        // Store all message IDs in our processed set to avoid duplicates
        uniqueMessages.forEach(msg => {
          if (msg._id) {
            processedMessagesRef.current.add(msg._id);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError('Failed to load chat messages');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentUser, deduplicateMessages]);

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.get('/chat/users/online');
      
      if (response && response.users) {
        setOnlineUsers(response.users);
      }
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  }, [currentUser]);

  // Send a new message with debounce and duplicate prevention
  const sendMessage = useCallback(async (messageText) => {
    // Validate message and check if already sending
    if (!currentUser || !messageText.trim() || isSending) return null;
    
    // Prevent duplicate messages being sent in quick succession
    const trimmedMessage = messageText.trim();
    if (recentlySentMessagesRef.current.has(trimmedMessage)) {
      console.log('Prevented duplicate message send:', trimmedMessage);
      return null;
    }
    
    try {
      // Set sending state to prevent multiple submissions
      setIsSending(true);
      
      // Add message to recently sent set (with 2-second expiry)
      recentlySentMessagesRef.current.add(trimmedMessage);
      setTimeout(() => {
        recentlySentMessagesRef.current.delete(trimmedMessage);
      }, 2000);
      
      const response = await api.post('/chat/messages', { text: trimmedMessage });
      
      if (response && response.message) {
        // Check if this message is already in our state (by ID or content)
        const newMessage = response.message;
        
        if (newMessage._id) {
          // Check if we've already processed this message ID
          if (processedMessagesRef.current.has(newMessage._id)) {
            console.log('Skipping already processed message:', newMessage._id);
            return null;
          }
          
          // Mark this message ID as processed
          processedMessagesRef.current.add(newMessage._id);
        }
        
        // Use functional update to safely add the new message
        setChatMessages(prev => {
          // First check if this message is already in the state
          const messageExists = prev.some(msg => 
            (msg._id && msg._id === newMessage._id) ||
            (!msg._id && msg.text === newMessage.text && msg.userId === newMessage.userId)
          );
          
          if (messageExists) {
            return prev; // Don't add duplicates
          }
          
          // Add the new message and deduplicate the whole array
          return deduplicateMessages([...prev, newMessage]);
        });
        
        return newMessage;
      }
      return null;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    } finally {
      setIsSending(false);
    }
  }, [currentUser, isSending, deduplicateMessages]);

  // Delete a message (admin only) 
  const deleteMessage = useCallback(async (messageId) => {
    if (!currentUser || !messageId) return false;
    
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      
      if (response && response.status === 'success') {
        // Remove message from state
        setChatMessages(prev => prev.filter(msg => msg._id !== messageId));
        
        // Remove from processed set
        processedMessagesRef.current.delete(messageId);
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
      return false;
    }
  }, [currentUser]);

  // Poll for new messages with deduplication
  const checkNewMessages = useCallback(async () => {
    if (!currentUser || !lastFetched) return;
    
    try {
      const response = await api.get(`/chat/messages/new?since=${lastFetched.toISOString()}`);
      
      if (response && response.messages && response.messages.length > 0) {
        // Filter out messages we've already processed
        const newMessages = response.messages.filter(msg => 
          msg._id && !processedMessagesRef.current.has(msg._id)
        );
        
        if (newMessages.length > 0) {
          // Add new messages to the processed set
          newMessages.forEach(msg => {
            if (msg._id) {
              processedMessagesRef.current.add(msg._id);
            }
          });
          
          // Use functional update to deduplicate when adding new messages
          setChatMessages(prev => deduplicateMessages([...prev, ...newMessages]));
          setUnreadCount(prev => prev + newMessages.length);
        }
        
        setLastFetched(new Date());
      }
    } catch (err) {
      console.error('Error checking for new messages:', err);
    }
  }, [currentUser, lastFetched, deduplicateMessages]);

  // Init chat data when user changes
  useEffect(() => {
    // Clean up existing intervals
    if (messagePollingRef.current) {
      clearInterval(messagePollingRef.current);
      messagePollingRef.current = null;
    }
    
    if (userPollingRef.current) {
      clearInterval(userPollingRef.current);
      userPollingRef.current = null;
    }
    
    if (currentUser) {
      // Clear processed messages set when user changes
      processedMessagesRef.current.clear();
      recentlySentMessagesRef.current.clear();
      
      // Fetch initial data
      fetchMessages();
      fetchOnlineUsers();
      
      // Set up polling intervals
      messagePollingRef.current = setInterval(checkNewMessages, 10000);
      userPollingRef.current = setInterval(fetchOnlineUsers, 30000);
    } else {
      // Reset state when user logs out
      setChatMessages([]);
      setOnlineUsers([]);
      setUnreadCount(0);
      setLastFetched(null);
      setIsSending(false);
    }
    
    // Clean up on unmount
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
      if (userPollingRef.current) {
        clearInterval(userPollingRef.current);
      }
    };
  }, [currentUser, fetchMessages, fetchOnlineUsers, checkNewMessages]);

  // Mark all messages as read
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Context value with memoized functions
  const value = {
    chatMessages,
    onlineUsers,
    loading,
    error,
    unreadCount,
    isSending,
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