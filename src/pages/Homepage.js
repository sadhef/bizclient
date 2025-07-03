import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Trophy, 
  Users, 
  ArrowRight, 
  Code, 
  Lock, 
  Globe, 
  Zap,
  Star,
  PlayCircle,
  ChevronDown,
  Github,
  Twitter,
  Linkedin,
  Mail,
  CheckCircle,
  Clock,
  Award,
  Brain,
  Sparkles
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button
} from '../components/ui';
import { 
  FloatingElement, 
  GlowingButton, 
  ParticleBackground,
  AnimatedGridPattern,
  NumberTicker,
  TypewriterEffect
} from '../components/magicui';
import { cn } from '../lib/utils';

const Homepage = () => {
  const history = useHistory();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  
  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });
  const isStatsInView = useInView(statsRef, { once: true });
  const isCtaInView = useInView(ctaRef, { once: true });

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Target,
      title: "Interactive Challenges",
      description: "Solve real-world cybersecurity challenges with hands-on experience in a safe environment.",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      icon: Trophy,
      title: "Competitive Leaderboards",
      description: "Compete with peers and track your progress on global and local leaderboards.",
      gradient: "from-green-600 to-blue-600"
    },
    {
      icon: Shield,
      title: "Secure Environment",
      description: "Practice in a controlled, secure environment designed for learning and skill assessment.",
      gradient: "from-red-600 to-orange-600"
    },
  ];

  const stats = [
    { label: "Active Users", value: 1250, suffix: "+" },
    { label: "Challenges", value: 50, suffix: "+" },
    { label: "Countries", value: 25, suffix: "+" },
    { label: "Success Rate", value: 85, suffix: "%" }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Security Engineer",
      content: "This platform transformed my understanding of cybersecurity. The challenges are incredibly realistic!",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "Penetration Tester",
      content: "Perfect for both beginners and advanced practitioners. Love the progressive difficulty system.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Cybersecurity Student",
      content: "Amazing learning experience! The hands-on approach really helps solidify theoretical knowledge.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground particleCount={50} />
      <AnimatedGridPattern className="opacity-10" />
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{ y: y1, opacity }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            {/* Logo/Brand */}
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0 }}
              animate={isHeroInView ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative">
                <div className="w-20 h-20 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
                  <Shield className="w-12 h-12 text-white dark:text-black" />
                </div>
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-black/20 to-gray-600/20 dark:from-white/20 dark:to-gray-400/20 rounded-3xl blur-xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-6xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-black dark:text-white">
                BizTras
              </span>
              <br />
              <TypewriterEffect 
                words={['CTF', 'Platform']}
                className="bg-gradient-to-r from-gray-700 to-black dark:from-gray-300 dark:to-white bg-clip-text text-transparent"
                delay={100}
              />
            </h1>

            {/* Subtitle */}
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Master cybersecurity through hands-on challenges. Test your skills, learn from experts, 
              and advance your career in the world's most critical field.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <GlowingButton
                onClick={() => history.push('/register')}
                className="group px-8 py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </GlowingButton>
              
              <Button
                onClick={() => history.push('/login')}
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={isHeroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button
              onClick={() => scrollToSection(featuresRef)}
              className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm mb-2 group-hover:text-black dark:group-hover:text-white">Explore Features</span>
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-2 h-2 bg-black dark:bg-white rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="absolute top-40 right-32 w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-1 h-1 bg-black dark:bg-white rounded-full"
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="py-32 px-6 relative"
        style={{ y: y2 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-black dark:text-white">
              Why Choose
              <span className="block bg-gradient-to-r from-gray-700 to-black dark:from-gray-300 dark:to-white bg-clip-text text-transparent">
                BizTras CTF?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the most comprehensive cybersecurity training platform designed for real-world application.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="group h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity",
                            feature.gradient
                          )} />
                          <div className="relative w-full h-full bg-black dark:bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-8 h-8 text-white dark:text-black" />
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>



      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
                © 2025 BizTras CTF Platform. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>Made by</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Sadhef
                </motion.div>
                <span>for cybersecurity education</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;