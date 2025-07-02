import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiUser, FiUsers, FiMessageCircle, FiClock, FiTrash2 } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';

// Debounce helper function to prevent rapid submissions
const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]);
};

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const formRef = useRef(null);
  const submittedMessagesRef = useRef(new Set());
  
  const { chatMessages, onlineUsers, loading, error, sendMessage, markAllAsRead, fetchMessages, isSending } = useChat();
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message groups
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if user has scrolled up (to disable auto-scroll)
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setAutoScroll(isScrolledToBottom);
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll]);

  // Force scroll to bottom regardless of autoScroll setting
  const forceScrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Mark messages as read when viewing the chat
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Ensure scroll is at bottom on initial load
  useEffect(() => {
    // Short timeout to ensure component is fully rendered
    const timer = setTimeout(() => {
      forceScrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [forceScrollToBottom]);

  // Actual message sending implementation, separated from the event handler
  const processSendMessage = useCallback(async (messageText) => {
    // Skip empty messages or messages that are already being sent
    if (!messageText.trim() || isSending || isSubmitting) return;
    
    // Check if we've already submitted this message recently to prevent duplicates
    const trimmedMessage = messageText.trim();
    if (submittedMessagesRef.current.has(trimmedMessage)) {
      console.log('Prevented duplicate submission:', trimmedMessage);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Track this message to prevent duplicates
      submittedMessagesRef.current.add(trimmedMessage);
      
      // Set a timeout to remove the message from tracked set after 3 seconds
      setTimeout(() => {
        submittedMessagesRef.current.delete(trimmedMessage);
      }, 3000);
      
      // Send the message through the context
      const result = await sendMessage(trimmedMessage);
      
      if (result) {
        // Clear the input field only on success
        setNewMessage('');
        // Force auto-scroll when user sends a message
        setAutoScroll(true);
        // Force scroll to bottom after sending a message
        setTimeout(() => forceScrollToBottom(), 100);
      }
    } catch (err) {
      console.error('Error in send message handler:', err);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSending, isSubmitting, sendMessage, forceScrollToBottom]);

  // Use debounce for the send message function to prevent rapid clicks
  const debouncedSendMessage = useDebounce(processSendMessage, 300);

  // Handle form submission with extra safeguards
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Prevent submission if already submitting or sending
    if (isSubmitting || isSending) {
      console.log('Prevented submission attempt while already processing');
      return;
    }
    
    // Use the debounced function to prevent rapid submissions
    debouncedSendMessage(newMessage);
  }, [newMessage, isSubmitting, isSending, debouncedSendMessage]);

  // Handle message deletion (admin only)
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!isAdmin) return;
    
    try {
      setDeletingMessageId(messageId);
      
      await api.delete(`/chat/messages/${messageId}`);
      
      // Refetch messages after successful deletion
      await fetchMessages();
      
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  }, [isAdmin, fetchMessages]);

  // Group messages by date for better display
  const groupMessagesByDate = useCallback(() => {
    const groups = {};
    
    chatMessages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  }, [chatMessages]);

  // Check if a message is from the current user
  const isOwnMessage = useCallback((message) => {
    return message.userId === currentUser?._id;
  }, [currentUser]);

  // Get user status (online/offline)
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.some(user => user._id === userId);
  }, [onlineUsers]);

  // Handle input change with duplicate prevention
  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    // Submit on Enter, but not with Shift+Enter (which should create a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className={`flex justify-between items-center p-4 z-10 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b`}>
        <div className="flex items-center">
          <FiMessageCircle className={`mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Community Chat
          </h2>
        </div>
        
        <div className="flex items-center">
          <FiUsers className={`mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {onlineUsers.length} online
          </span>
        </div>
      </div>

      {/* Chat messages container with fixed height and scrolling */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
        onScroll={handleScroll}
        style={{ minHeight: 0 }} // Critical for flexbox children with overflow
      >
        {loading && chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${
              isDark ? 'border-indigo-400' : 'border-indigo-600'
            }`}></div>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
          } text-center`}>
            {error}
          </div>
        ) : chatMessages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <FiMessageCircle size={48} className="mb-4 opacity-20" />
            <p>No messages yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          // Grouped messages by date
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <div className={`flex-grow h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`mx-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDate(new Date(group.date))}
                </div>
                <div className={`flex-grow h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
              
              {/* Messages in this group */}
              {group.messages.map((message, index) => {
                const own = isOwnMessage(message);
                
                return (
                  <div 
                    key={message._id || `${message.userId}-${index}`} 
                    className={`flex ${own ? 'justify-end' : 'justify-start'} mb-4 group`}
                  >
                    {/* Avatar for other users' messages */}
                    {!own && (
                      <div className="flex-shrink-0 mr-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isDark ? 'bg-indigo-900' : 'bg-indigo-100'
                        }`}>
                          <FiUser className={isDark ? 'text-indigo-300' : 'text-indigo-600'} />
                        </div>
                        <div className={`flex justify-center mt-1 ${
                          isUserOnline(message.userId) 
                            ? 'text-green-500' 
                            : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            isUserOnline(message.userId) ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl relative`}>
                      {/* Username for other users' messages */}
                      {!own && (
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          {message.userName}
                        </div>
                      )}
                      
                      {/* Message content */}
                      <div className={`px-4 py-2 rounded-lg ${
                        own
                          ? isDark 
                            ? 'bg-indigo-900 text-white' 
                            : 'bg-indigo-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-200'
                            : 'bg-white text-gray-800'
                      }`}>
                        {/* Admin delete button */}
                        {isAdmin && message._id && (
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            disabled={deletingMessageId === message._id}
                            className={`absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 p-1 rounded-full ${
                              isDark ? 'bg-red-900 text-red-200' : 'bg-red-500 text-white'
                            } hover:bg-red-700 transition-opacity`}
                            aria-label="Delete message"
                          >
                            {deletingMessageId === message._id ? (
                              <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
                          </button>
                        )}
                        
                        <p className="break-words">{message.text}</p>
                        <div className={`text-xs mt-1 text-right ${
                          own
                            ? isDark ? 'text-indigo-200' : 'text-indigo-100'
                            : isDark ? 'text-gray-400' : 'text-gray-500'
                        } flex items-center justify-end`}>
                          <FiClock className="mr-1" size={10} />
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Avatar for own messages */}
                    {own && (
                      <div className="flex-shrink-0 ml-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isDark ? 'bg-indigo-900' : 'bg-indigo-100'
                        }`}>
                          <FiUser className={isDark ? 'text-indigo-300' : 'text-indigo-600'} />
                        </div>
                        <div className="flex justify-center mt-1 text-green-500">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } z-10`}>
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending || isSubmitting}
            className={`flex-grow px-4 py-2 rounded-l-lg focus:outline-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
            } border disabled:opacity-60`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || isSubmitting}
            className={`px-4 py-2 rounded-r-lg ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } disabled:opacity-50 transition-colors min-w-[40px] h-[40px] flex items-center justify-center`}
            aria-label="Send message"
          >
            {isSending || isSubmitting ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
            ) : (
              <FiSend />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;