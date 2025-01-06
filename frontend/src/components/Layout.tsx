import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Download,
  Shuffle,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Database,
  Cpu,
  Cloud,
  Lock,
  RefreshCw,
  Eye,
  Filter,
  Plus,
  Home,
  Layers,
  Users,
  FileText,
  Calendar,
  Clock,
  Bookmark,
  Star,
  Archive,
  Trash2,
  Edit,
  Share2,
  Copy,
  Download as DownloadIcon,
  Upload,
  Send,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Truck,
  Warehouse,
  Package2,
  BarChart,
  PieChart,
  LineChart,
  TrendingDown,
  Target,
  Award,
  Flag,
  Tag,
  Hash,
  Percent,
  Calculator,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Hourglass,
  Gauge,
  Thermometer,
  Battery,
  Wifi,
  Signal,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  Image,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Folder,
  FolderOpen,
  Save,
  Download as DownloadIcon2,
  Upload as UploadIcon,
  Link as LinkIcon,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Scissors,
  Palette,
  Brush,
  Pen,
  Pencil,
  Eraser,
  Highlighter,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Terminal,
  Command,
  Keyboard,
  Mouse,
  Gamepad2,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  HardDrive,
  SdCard,
  Usb,
  Bluetooth,
  Nfc,
  Qr,
  Barcode,
  Scan,
  ScanLine,
  Fingerprint,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  Key,
  Unlock,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users2,
  UserCog,
  Crown,
  Gem,
  Diamond,
  Heart,
  Star as StarIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Zap as ZapIcon,
  Flame,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
  Droplets,
  Wind,
  Tornado,
  Rainbow,
  Sunrise,
  Sunset,
  Eclipse,
  Cloudy,
  PartlyCloudy,
  ThermometerSun,
  ThermometerSnowflake,
  Umbrella,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Leaf,
  Seedling,
  Sprout,
  Cactus,
  Cherry,
  Apple,
  Banana,
  Grape,
  Strawberry,
  Carrot,
  Corn,
  Wheat,
  Coffee,
  Wine,
  Beer,
  Milk,
  Soup,
  Pizza,
  Sandwich,
  Cookie,
  Cake,
  IceCream,
  Candy,
  Lollipop,
  Utensils,
  UtensilsCrossed,
  ChefHat,
  Scissors as ScissorsIcon,
  Hammer,
  Wrench,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Compass,
  Paintbrush,
  Palette as PaletteIcon,
  Pipette,
  Syringe,
  Pill,
  Stethoscope,
  Thermometer as ThermometerIcon,
  Bandage,
  FirstAid,
  Dna,
  Virus,
  Bug,
  Microscope,
  TestTube,
  Beaker,
  FlaskConical,
  Atom,
  Magnet,
  Zap as ElectricIcon,
  Lightbulb,
  Flashlight,
  Candle,
  Lamp,
  LampDesk,
  LampFloor,
  LampWall,
  Fan,
  AirVent,
  Heater,
  Snowflake as SnowflakeIcon,
  Refrigerator,
  Washing,
  Dryer,
  Iron,
  Scissors as CutIcon,
  Paperclip,
  Pin,
  Pushpin,
  Thumbtack,
  Magnet as MagnetIcon,
  Anchor,
  Chain,
  Link2,
  Unlink,
  Shuffle as ShuffleIcon,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Play,
  Pause,
  Stop,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Rhombus,
  Shapes,
  Box,
  Cube,
  Cylinder,
  Sphere,
  Pyramid,
  Cone,
  Torus,
  Mesh,
  Grid,
  Layers as LayersIcon,
  Stack,
  Columns,
  Rows,
  Layout as LayoutIcon,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  PanelBottomClose,
  SplitSquareHorizontal,
  SplitSquareVertical,
  RectangleHorizontal,
  RectangleVertical,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Inventory', href: '/inventory', icon: Package, badge: '2.3K' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
    { name: 'ETL Manager', href: '/etl', icon: Database, badge: null },
    { name: 'Rules Engine', href: '/rules', icon: Zap, badge: '24' },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null },
  ]

  const quickActions = [
    { name: 'Add Item', icon: Plus, action: () => {} },
    { name: 'Import Data', icon: Upload, action: () => {} },
    { name: 'Export Report', icon: DownloadIcon, action: () => {} },
    { name: 'Generate Insights', icon: TrendingUp, action: () => {} },
  ]

  const notifications = [
    { id: 1, type: 'warning', message: 'Low stock alert for 5 items', time: '2 min ago' },
    { id: 2, type: 'success', message: 'ETL process completed successfully', time: '15 min ago' },
    { id: 3, type: 'info', message: 'New analytics report available', time: '1 hour ago' },
  ]

  const systemStats = [
    { label: 'Items', value: '2,345', icon: Package, color: 'text-blue-600' },
    { label: 'Categories', value: '56', icon: Layers, color: 'text-green-600' },
    { label: 'Locations', value: '12', icon: MapPin, color: 'text-purple-600' },
    { label: 'Suppliers', value: '89', icon: Building, color: 'text-orange-600' },
  ]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Inventory</h1>
                <p className="text-xs text-muted-foreground">v2.0 Enterprise</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Main Navigation
              </h3>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Quick Actions
              </h3>
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="sidebar-item w-full text-left"
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.name}</span>
                </button>
              ))}
            </div>

            {/* System Stats */}
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                System Overview
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {systemStats.map((stat) => (
                  <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secured</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="layout-header">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    className="pl-10 pr-4 py-2 w-80 input-field"
                  />
                </div>
                <button className="btn-outline">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time Status */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>99.9%</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-foreground">+12.5%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-foreground">AI Active</span>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-muted"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-muted relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="dropdown-menu"
                  >
                    <Link to="/profile" className="dropdown-item">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <button onClick={handleLogout} className="dropdown-item text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="layout-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="layout-footer">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>© 2025 Enterprise Inventory System v2.0</span>
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4" />
                <span>Cloud-Native</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4 text-green-600" />
                <span>All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4" />
                <span>Last Updated: Just now</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout