import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiShield, 
  FiTarget, 
  FiUsers, 
  FiTrendingUp, 
  FiPlay, 
  FiArrowRight,
  FiCode,
  FiLock,
  FiAward,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiGlobe
} from 'react-icons/fi';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: FiShield,
      title: 'Secure Challenges',
      description: 'Advanced cybersecurity challenges designed to test your skills in real-world scenarios.'
    },
    {
      icon: FiTarget,
      title: 'Progressive Levels',
      description: 'Multi-level challenges that increase in difficulty as you advance through the platform.'
    },
    {
      icon: FiUsers,
      title: 'Team Competition',
      description: 'Compete with other security enthusiasts and climb the leaderboard rankings.'
    },
    {
      icon: FiTrendingUp,
      title: 'Skill Development',
      description: 'Enhance your penetration testing and vulnerability assessment capabilities.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Security Challenges' },
    { number: '10K+', label: 'Active Users' },
    { number: '50+', label: 'Skill Categories' },
    { number: '99%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="grid grid-cols-12 gap-4 h-full opacity-20">
              {Array.from({ length: 144 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border border-gray-300 dark:border-gray-700"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animation: 'fadeInScale 2s ease-in-out infinite alternate'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  CAPTURE
                </span>
                <br />
                <span className="text-black dark:text-white">THE FLAG</span>
              </h1>
              <div className="w-32 h-1 bg-black dark:bg-white mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Master cybersecurity through hands-on challenges. Test your skills, 
                learn new techniques, and compete with the best in the field.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {isAuthenticated() ? (
                <Link
                  to={user?.isAdmin ? '/admin' : '/dashboard'}
                  className="group bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                >
                  <FiPlay className="w-5 h-5" />
                  Enter Platform
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                  >
                    <FiPlay className="w-5 h-5" />
                    Start Challenge
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="group border-2 border-black dark:border-white text-black dark:text-white px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 flex items-center gap-3"
                  >
                    <FiLock className="w-5 h-5" />
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl md:text-4xl font-black text-black dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-black dark:bg-white"></div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6">
              WHY BIZTRAS CTF?
            </h2>
            <div className="w-24 h-1 bg-black dark:bg-white mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the most comprehensive cybersecurity challenge platform 
              designed for security professionals and enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 p-8 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white text-white dark:text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-4 uppercase tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            READY TO TAKE THE CHALLENGE?
          </h2>
          <div className="w-32 h-1 bg-white dark:bg-black mx-auto mb-8"></div>
          <p className="text-xl mb-12 text-gray-300 dark:text-gray-700">
            Join thousands of security professionals who have enhanced their skills through our platform.
          </p>
          {!isAuthenticated() && (
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-white dark:bg-black text-black dark:text-white px-12 py-4 text-xl font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <FiAward className="w-6 h-6" />
              Get Started Now
              <FiArrowRight className="w-6 h-6" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t-4 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-black font-black text-xl">BT</span>
                </div>
                <span className="text-2xl font-black text-black dark:text-white">BIZTRAS CTF</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
                The premier cybersecurity challenge platform for security professionals, 
                students, and enthusiasts worldwide. Master your skills through hands-on experience.
              </p>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <FiGithub className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <FiLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                    Login
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-gray-600 dark:text-gray-400">contact@biztrastech.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-gray-600 dark:text-gray-400">www.biztrastech.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 border-gray-200 dark:border-gray-800 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                © 2024 BizTras Technologies. All rights reserved.
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;