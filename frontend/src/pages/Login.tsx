import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import {
  Package,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Database,
  BarChart3,
  Cpu,
  Globe,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Award,
  Activity,
  Cloud,
  Layers,
  Target,
  Sparkles
} from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isLoading, error } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const features = [
    {
      icon: Database,
      title: 'Multi-Format ETL',
      description: '9 supported formats with AI-powered processing'
    },
    {
      icon: Zap,
      title: 'Smart Rules Engine',
      description: 'Automated business logic and intelligent alerts'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'ML insights with demand forecasting'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with compliance'
    },
    {
      icon: Cloud,
      title: 'Cloud-Native',
      description: 'Scalable architecture with 99.9% uptime'
    },
    {
      icon: Cpu,
      title: 'AI-Powered',
      description: 'Machine learning for optimization'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Operations Director',
      company: 'TechCorp Inc.',
      quote: 'Reduced inventory costs by 30% and eliminated stockouts completely.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Warehouse Manager',
      company: 'Global Logistics',
      quote: 'The AI insights are incredible. It predicted our seasonal demand perfectly.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Supply Chain Manager',
      company: 'RetailMax',
      quote: 'Best inventory system we\'ve ever used. The automation saves us hours daily.',
      rating: 5
    }
  ]

  const stats = [
    { label: 'Companies Trust Us', value: '500+', icon: Users },
    { label: 'Cost Reduction', value: '30%', icon: TrendingUp },
    { label: 'Uptime Guarantee', value: '99.9%', icon: Award },
    { label: 'Processing Speed', value: '10x', icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
            >
              <Package className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Enterprise Inventory
            </h1>
            <p className="text-gray-600">
              AI-Powered Inventory Management System v2.0
            </p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Welcome Back
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button className="text-primary hover:text-primary/80 font-medium">
                  Contact your administrator
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-xs text-blue-700">
                <p><strong>Admin:</strong> admin@demo.com / admin123</p>
                <p><strong>Manager:</strong> manager@demo.com / manager123</p>
                <p><strong>User:</strong> user@demo.com / user123</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Features and Marketing */}
      <div className="flex-1 bg-gradient-to-br from-primary via-primary to-purple-600 text-white p-8 hidden lg:flex flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Enterprise Grade</h2>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              The most advanced inventory management system with AI-powered automation and enterprise security.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <stat.icon className="w-6 h-6" />
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-blue-100">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Powerful Features</h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-4"
                >
                  <feature.icon className="w-6 h-6 mb-3 text-blue-200" />
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-blue-100">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold mb-4">What Our Customers Say</h3>
          {testimonials.slice(0, 1).map((testimonial, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                ))}
              </div>
              <p className="text-blue-100 mb-3">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-blue-200">{testimonial.role}, {testimonial.company}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center space-x-3 mt-8"
        >
          <Shield className="w-6 h-6" />
          <div>
            <p className="font-semibold">Enterprise Security</p>
            <p className="text-sm text-blue-100">SOC 2 Type II Certified • ISO 27001 Compliant</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login