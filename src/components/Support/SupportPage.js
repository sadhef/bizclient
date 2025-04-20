import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Chat from './Chat';
import { FiMessageCircle, FiHelpCircle, FiInfo, FiBookOpen, FiFileText } from 'react-icons/fi';

const SupportPage = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('chat');

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  // Tabs configuration
  const tabs = [
    {
      id: 'chat',
      label: 'Community Chat',
      icon: <FiMessageCircle className="mr-2" />,
      component: <Chat />
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <FiHelpCircle className="mr-2" />,
      component: <FAQ isDark={isDark} />
    }
  ];

  // Get active tab component
  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Help & Support Center
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get help, ask questions, and connect with other users
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex overflow-x-auto mb-6 border-b scrollbar-hide pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-4 px-4 py-2 rounded-t-lg flex items-center whitespace-nowrap ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
                    : 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={`rounded-lg overflow-hidden shadow-lg h-[calc(100vh-250px)] ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {activeComponent}
        </div>
      </div>
    </div>
  );
};

// FAQ Component
const FAQ = ({ isDark }) => {
  const faqs = [
    {
      question: "How do I start a challenge?",
      answer: "After logging in, navigate to the Challenges page from the navbar. The system will automatically present you with your current challenge. Read the description carefully and try to find the flag."
    },
    {
      question: "What is a flag?",
      answer: "A flag is a special string of text that you need to find or generate as the answer to a challenge. It's usually in the format flag{some_text_here} and submitting the correct flag completes the challenge."
    },
    {
      question: "I'm stuck on a challenge. What can I do?",
      answer: "Each challenge has a hint available if you're stuck. Click the 'Use Hint' button on the challenge page. Additionally, you can ask for help in the Community Chat, but avoid sharing exact solutions."
    },
    {
      question: "How is my progress tracked?",
      answer: "Your progress is automatically saved as you complete challenges. The system tracks which challenges you've completed, your current challenge, and the time you have remaining."
    },
    {
      question: "What happens if I run out of time?",
      answer: "If your timer reaches zero, your session ends and you'll no longer be able to submit flags. The system will record your progress up to that point."
    },
    {
      question: "Can I pause the timer?",
      answer: "No, once you start the challenges, the timer continues even if you log out. This is to maintain fairness for all participants."
    }
  ];

  return (
    <div className={`p-6 h-full overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Frequently Asked Questions
      </h2>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {faq.question}
            </h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SupportPage;