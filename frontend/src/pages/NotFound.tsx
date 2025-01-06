import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  Home,
  ArrowLeft,
  Search,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Mail,
  Compass,
  MapPin,
  Route,
  Navigation,
  Star,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const quickActions = [
    {
      icon: Home,
      label: 'Go to Dashboard',
      description: 'Return to the main dashboard',
      action: () => navigate('/dashboard')
    },
    {
      icon: Package,
      label: 'View Inventory',
      description: 'Browse your inventory items',
      action: () => navigate('/inventory')
    },
    {
      icon: Search,
      label: 'Search Items',
      description: 'Find specific inventory items',
      action: () => navigate('/inventory?search=true')
    },
    {
      icon: HelpCircle,
      label: 'Get Help',
      description: 'Access help documentation',
      action: () => window.open('/help', '_blank')
    }
  ]

  const popularPages = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Inventory Management', path: '/inventory', icon: Package },
    { name: 'Analytics', path: '/analytics', icon: Target },
    { name: 'ETL Manager', path: '/etl', icon: Zap },
    { name: 'Rules Engine', path: '/rules', icon: Lightbulb },
    { name: 'Settings', path: '/settings', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Main 404 Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 mb-4">
              404
            </h1>
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-16 h-16 text-blue-400 opacity-30" />
              </motion.div>
              <AlertCircle className="w-24 h-24 text-blue-600 mx-auto" />
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              The page you're looking for seems to have wandered off.
            </p>
            <p className="text-gray-500">
              Don't worry, even the best inventory systems lose track of things sometimes!
            </p>
          </motion.div>

          {/* Primary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center space-x-4 mb-12"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            What would you like to do instead?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={action.action}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 text-left border border-gray-200"
              >
                <action.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">{action.label}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Popular Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {popularPages.map((page, index) => (
              <motion.button
                key={page.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(page.path)}
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <page.icon className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">{page.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            Still can't find what you're looking for?
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => window.open('/help', '_blank')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => window.open('mailto:support@company.com')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-20 left-10 text-blue-300 opacity-20"
        >
          <Package className="w-12 h-12" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          className="absolute top-32 right-20 text-purple-300 opacity-20"
        >
          <MapPin className="w-8 h-8" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
          className="absolute bottom-32 left-20 text-blue-300 opacity-20"
        >
          <Route className="w-10 h-10" />
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound