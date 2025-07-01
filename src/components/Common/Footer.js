import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaHeart, FaCode, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Challenge Platform
              </span>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 max-w-md`}>
              Empowering developers through interactive challenges and continuous learning. 
              Build your skills, track your progress, and join a community of learners.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['About', 'Features', 'Pricing', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
              Support
            </h3>
            <ul className="space-y-2">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Status'].map((item) => (
                <li key={item}>
                  <a href="#" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-center`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
            © {currentYear} Challenge Platform. Made with <FaHeart className="h-4 w-4 text-red-500 mx-1" /> and <FaCode className="h-4 w-4 text-blue-500 mx-1" />
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-4 md:mt-0`}>
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;