import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlay, 
  FiArrowRight,
  FiLock,
  FiAward,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiGlobe,
  FiStar,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiTarget,
  FiCode,
  FiActivity
} from 'react-icons/fi';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { 
      number: '10,000+', 
      label: 'Active Security Professionals',
      icon: FiUsers,
      description: 'Join thousands of cybersecurity experts'
    },
    { 
      number: '500+', 
      label: 'Security Challenges',
      icon: FiTarget,
      description: 'Comprehensive challenge library'
    },
    { 
      number: '50+', 
      label: 'Skill Categories',
      icon: FiCode,
      description: 'From web security to cryptography'
    },
    { 
      number: '99.9%', 
      label: 'Platform Uptime',
      icon: FiActivity,
      description: 'Reliable 24/7 availability'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border border-gray-200/20 dark:border-gray-800/20 transition-all duration-1000"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    animation: 'fadeIn 2s ease-in-out infinite alternate'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-xl animate-float" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-black/10 dark:bg-white/10 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-black/5 dark:bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            {/* Hero badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-full mb-8">
              <FiStar className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium">Trusted by 10,000+ Security Professionals</span>
            </div>

            {/* Main headline */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none tracking-tighter">
              <span className="block bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                MASTER
              </span>
              <span className="block text-black dark:text-white">
                CYBERSECURITY
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Challenge yourself with real-world security scenarios. 
              <span className="text-black dark:text-white font-medium"> Learn. Practice. Excel.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {isAuthenticated() ? (
                <Link
                  to={user?.isAdmin ? '/admin' : '/dashboard'}
                  className="group relative inline-flex items-center gap-3 px-12 py-6 bg-black dark:bg-white text-white dark:text-black text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <FiPlay className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Enter Platform</span>
                  <FiArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center gap-3 px-12 py-6 bg-black dark:bg-white text-white dark:text-black text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-none overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <FiZap className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Start Challenge</span>
                    <FiArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-3 px-12 py-6 border-2 border-black dark:border-white text-black dark:text-white text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none"
                  >
                    <FiLock className="w-6 h-6" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="group text-center"
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-black dark:text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider mb-2">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {stat.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <div className="w-0.5 h-16 bg-black dark:bg-white" />
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Scroll</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full mb-8">
            <FiZap className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Ready to Excel?</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-black dark:text-white mb-8 leading-none">
            START YOUR
            <br />
            <span className="bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
              JOURNEY TODAY
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join the elite community of cybersecurity professionals. 
            <span className="text-black dark:text-white font-semibold"> Master real-world challenges. Advance your career.</span>
          </p>

          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-3 px-12 py-6 bg-black dark:bg-white text-white dark:text-black text-xl font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <FiAward className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Get Started Free</span>
                <FiArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
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

          {/* Trust indicators */}
          <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wider font-medium">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Tesla'].map((company, index) => (
                <div key={index} className="text-lg font-bold text-gray-400 dark:text-gray-600">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black dark:bg-white text-white dark:text-black border-t-4 border-white dark:border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white dark:bg-black flex items-center justify-center rounded-none">
                  <span className="text-black dark:text-white font-black text-2xl">BT</span>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tighter">BIZTRAS CTF</div>
                  <div className="text-sm text-gray-400 dark:text-gray-600 uppercase tracking-wider">Cybersecurity Excellence</div>
                </div>
              </div>
              
              <p className="text-gray-300 dark:text-gray-700 text-base leading-relaxed mb-6 max-w-md">
                The world's premier cybersecurity challenge platform. Master real-world security scenarios and advance your career in cybersecurity.
              </p>
              
              {/* Social links */}
              <div className="flex gap-4">
                {[
                  { icon: FiGithub, href: '#', label: 'GitHub' },
                  { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
                  { icon: FiTwitter, href: '#', label: 'Twitter' },
                  { icon: FiMail, href: '#', label: 'Email' }
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-12 h-12 bg-white/10 dark:bg-black/10 flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200 group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Platform</h3>
              <ul className="space-y-4">
                {[
                  { label: 'Sign Up', href: '/register' },
                  { label: 'Sign In', href: '/login' },
                  { label: 'About Us', href: '#' },
                  { label: 'Contact', href: '#' }
                ].map((link, index) => (
                  <li key={index}>
                    {link.href.startsWith('/') ? (
                      <Link 
                        to={link.href} 
                        className="text-gray-300 dark:text-gray-700 hover:text-white dark:hover:text-black transition-colors duration-200 font-medium"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-gray-300 dark:text-gray-700 hover:text-white dark:hover:text-black transition-colors duration-200 font-medium"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Support</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiMail className="w-5 h-5 text-gray-400 dark:text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">Email</div>
                    <div className="font-medium">support@biztrastech.com</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiGlobe className="w-5 h-5 text-gray-400 dark:text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">Website</div>
                    <div className="font-medium">www.biztrastech.com</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-gray-400 dark:text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">Support Hours</div>
                    <div className="font-medium">24/7 Available</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/10 dark:border-black/10 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 dark:text-gray-600 font-medium">
                © 2024 BizTras Technologies. All rights reserved.
              </div>
              
              <div className="flex flex-wrap gap-8">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 text-sm font-medium"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Final branding */}
            <div className="text-center mt-8 pt-6 border-t border-white/5 dark:border-black/5">
              <div className="text-gray-500 dark:text-gray-500 text-sm">
                Built with ❤️ for the cybersecurity community
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
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

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
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