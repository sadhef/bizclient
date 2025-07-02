import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
  Progress
} from '../../components/ui';
import { 
  FloatingElement, 
  GlowingButton, 
  ParticleBackground,
  AnimatedGridPattern,
  RippleEffect,
  TypewriterEffect,
  AnimatedProgressRing
} from '../../components/magicui';
import { cn } from '../../lib/utils';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
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

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength <= 25) return { label: 'Weak', color: 'text-red-400' };
    if (strength <= 50) return { label: 'Fair', color: 'text-amber-400' };
    if (strength <= 75) return { label: 'Good', color: 'text-blue-400' };
    return { label: 'Strong', color: 'text-emerald-400' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await register(formData);
      
      if (result.success) {
        const redirectPath = result.redirectTo || (result.user.isAdmin ? '/admin' : '/dashboard');
        history.push(redirectPath);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrengthLabel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground particleCount={30} />
      <AnimatedGridPattern className="opacity-10" />
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Header Section */}
        <FloatingElement delay={0} className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-6 shadow-2xl shadow-purple-500/25"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UserPlus className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Join BizTras CTF
            </span>
          </h1>
          
          <div className="text-slate-400 text-lg mb-4">
            <TypewriterEffect 
              words={['Create', 'your', 'account', 'to', 'start', 'the', 'challenge']}
              delay={80}
            />
          </div>
          
          <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">
            <Sparkles className="w-3 h-3 mr-1" />
            Secure Registration
          </Badge>
        </FloatingElement>

        {/* Registration Card */}
        <FloatingElement delay={0.2}>
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="text-slate-400">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-200 font-medium">
                    Username
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20",
                        errors.username && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Choose a username"
                      disabled={loading}
                    />
                    {formData.username && !errors.username && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20",
                        errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                    {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20",
                        errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Create a password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">Password Strength</span>
                        <span className={cn("text-xs font-medium", passwordStrength.color)}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={getPasswordStrength()} className="h-2" />
                    </motion.div>
                  )}
                  
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20",
                        errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <RippleEffect>
                  <GlowingButton
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                  >
                    {loading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </motion.div>
                    )}
                  </GlowingButton>
                </RippleEffect>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        {/* Registration Notice */}
        <FloatingElement delay={0.4}>
          <Card className="mt-6 bg-blue-500/10 backdrop-blur-xl border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-200 mb-2">
                    Registration Information
                  </h3>
                  <div className="text-sm text-blue-100/80">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Regular user accounts need admin approval to access challenges</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <span>Admin accounts have immediate access to the Admin Dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                        <span>You'll receive notifications once your account is approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        {/* Security Features */}
        <FloatingElement delay={0.6}>
          <Card className="mt-4 bg-emerald-500/10 backdrop-blur-xl border-emerald-500/20">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-emerald-200 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security Features
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-emerald-100/80">
                <div className="flex items-center space-x-2 p-2 bg-emerald-500/10 rounded">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Encrypted Storage</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-emerald-500/10 rounded">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Secure Authentication</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-emerald-500/10 rounded">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Data Protection</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-emerald-500/10 rounded">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Privacy Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>
      </div>
    </div>
  );
};

export default Register;