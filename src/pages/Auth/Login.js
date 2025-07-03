import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, Sparkles } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Badge
} from '../../components/ui';
import { 
  FloatingElement, 
  GlowingButton, 
  ParticleBackground,
  AnimatedGridPattern,
  RippleEffect,
  TypewriterEffect
} from '../../components/magicui';
import { cn } from '../../lib/utils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const redirectPath = result.redirectTo || (result.user.isAdmin ? '/admin' : '/dashboard');
        history.push(redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground particleCount={30} />
      <AnimatedGridPattern className="opacity-10" />
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gray-800/5 dark:bg-gray-200/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Header Section */}
        <FloatingElement delay={0} className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-2xl shadow-black/25 dark:shadow-white/25"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="w-10 h-10 text-white dark:text-black" />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-black dark:text-white">
              Welcome Back
            </span>
          </h1>
          
          <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            <TypewriterEffect 
              words={['Sign', 'in', 'to', 'BizTras', 'CTF', 'Platform']}
              delay={100}
            />
          </div>
          
          <Badge variant="outline" className="border-black/30 dark:border-white/30 text-black dark:text-white bg-black/5 dark:bg-white/5">
            <Sparkles className="w-3 h-3 mr-1" />
            Secure Authentication
          </Badge>
        </FloatingElement>

        {/* Login Card */}
        <FloatingElement delay={0.2}>
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-black dark:text-white">Sign In</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-black/20 dark:focus:ring-white/20",
                        errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800 dark:text-gray-200 font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 pr-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black dark:focus:border-white focus:ring-black/20 dark:focus:ring-white/20",
                        errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <RippleEffect>
                  <GlowingButton
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="w-full h-12 text-lg font-semibold"
                  >
                    {loading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Sign In
                      </motion.div>
                    )}
                  </GlowingButton>
                </RippleEffect>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 hover:underline"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        

        
      </div>
    </div>
  );
};

export default Login;