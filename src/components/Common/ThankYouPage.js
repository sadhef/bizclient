import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCheck } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThankYouPage = () => {
    const { isDark } = useTheme();
    
    return (
        <div className={`flex items-center justify-center min-h-screen ${
            isDark 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-violet-900' 
                : 'bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900'
        }`}>
            <div className={`max-w-md w-full mx-4 ${
                isDark ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-xl overflow-hidden`}>
                <div className={`p-4 ${
                    isDark ? 'bg-violet-900' : 'bg-violet-700'
                } flex justify-center`}>
                    <div className="rounded-full bg-white p-2">
                        <FiCheck className="h-8 w-8 text-violet-700" />
                    </div>
                </div>
                
                <div className="p-6 text-center">
                    <h2 className={`text-3xl font-bold ${
                        isDark ? 'text-violet-300' : 'text-violet-700'
                    } mb-4`}>Thank You for Participating!</h2>
                    
                    <p className={`text-lg ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                    } mb-6`}>
                        We appreciate your time and effort in completing the challenges.
                    </p>
                    
                    <div className="animate-pulse mb-6">
                        <div className={`h-2 ${
                            isDark ? 'bg-violet-700' : 'bg-violet-200'
                        } rounded w-16 mx-auto`}></div>
                    </div>
                    
                    <p className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                    } mb-8`}>
                        Your results have been recorded. You may close this window or return to the home page.
                    </p>
                    
                    <Link 
                        to="/" 
                        className={`inline-flex items-center px-4 py-2 ${
                            isDark 
                                ? 'bg-violet-700 hover:bg-violet-600' 
                                : 'bg-violet-600 hover:bg-violet-700'
                        } text-white rounded-lg transition-colors duration-200`}
                    >
                        <FiHome className="mr-2" />
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;