import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlay, 
  FiArrowRight,
  FiLock,
  FiAward,
  FiZap,
  FiCheckCircle,
  FiUsers,
  FiTarget,
  FiShield,
  FiStar
} from 'react-icons/fi';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: FiShield,
      title: 'Professional Security Training',
      description: 'Industry-standard cybersecurity challenges designed by experts'
    },
    {
      icon: FiTarget,
      title: 'Progressive Difficulty',
      description: 'Carefully crafted levels that build your skills step by step'
    },
    {
      icon: FiUsers,
      title: 'Expert Community',
      description: 'Learn from and compete with top security professionals'
    },
    {
      icon: FiAward,
      title: 'Professional Recognition',
      description: 'Earn certificates and build your cybersecurity portfolio'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900" />
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-xl animate-float" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-black/10 dark:bg-white/10 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-black/5 dark:bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            {/* Hero badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-full mb-8">
              <FiStar className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-black dark:text-white">
                Think. Solve. Triumph
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-none tracking-tighter text-black dark:text-white">
              READY
              <br />
              <span className="bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                FOR A CHALLENGE !
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
              Challenge yourself with real-world scenarios. 
              <span className="text-black dark:text-white font-semibold"> Learn. Practice. Excel.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {isAuthenticated() ? (
                <Link
                  to={user?.isAdmin ? '/admin' : '/dashboard'}
                  className="btn-professional-primary group"
                >
                  <FiPlay className="w-5 h-5" />
                  <span>Enter Platform</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-professional-primary group"
                  >
                    <FiZap className="w-5 h-5" />
                    <span>Start Challenge</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-professional-secondary group"
                  >
                    <FiLock className="w-5 h-5" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-4">
              Why Choose Re-Challenge CTF?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Professional-grade cybersecurity training platform designed for serious learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-enhanced text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-xl mb-6 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full mb-8">
            <FiZap className="w-4 h-4 text-black dark:text-white" />
            <span className="text-sm font-medium text-black dark:text-white">Ready to Excel?</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6 leading-none">
            START YOUR
            <br />
            <span className="bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
              JOURNEY TODAY
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join the Platform and 
            <span className="text-black dark:text-white font-semibold"> Master real-world challenges. Advance your career.</span>
          </p>

          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                to="/register"
                className="btn-professional-primary group"
              >
                <FiAward className="w-5 h-5" />
                <span>Get Started Free</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black dark:bg-white text-white dark:text-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-600 text-sm">
              © 2024 Re-Challenge Technologies. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;