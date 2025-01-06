import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  ShoppingCart,
  Truck,
  Building,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Globe,
  Database,
  Cpu,
  Cloud,
  RefreshCw,
  Eye,
  Filter,
  Download,
  Share2,
  Settings,
  Plus,
  ArrowRight,
  Calendar,
  Star,
  Target,
  Award,
  Flag,
  Bookmark,
  Heart,
  Bell,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Link,
  Copy,
  Edit,
  Trash2,
  Archive,
  Send,
  Mail,
  Phone,
  MapPin,
  Layers,
  Grid,
  List,
  Table,
  Columns,
  Rows,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCcw,
  FlipHorizontal,
  Move,
  Crop,
  Palette,
  Brush,
  Pen,
  Eraser,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Terminal,
  Keyboard,
  Mouse,
  Monitor,
  Smartphone,
  Tablet,
  Server,
  HardDrive,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Volume2,
  Mic,
  Camera,
  Video,
  Image,
  File,
  Folder,
  Save,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronUp,
  ChevronLeft,
  MoreHorizontal,
  Gamepad2,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Laptop,
  Desktop,
  SdCard,
  Usb,
  Nfc,
  Qr,
  Barcode,
  Scan,
  Fingerprint,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  UserPlus,
  Crown,
  Gem,
  Diamond,
  Smile,
  Frown,
  Laugh,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Snowflake,
  Flame,
  TreePine,
  Flower,
  Leaf,
  Coffee,
  Pizza,
  Cake,
  Utensils,
  Hammer,
  Wrench,
  Screwdriver,
  Ruler,
  Paintbrush,
  Scissors,
  Paperclip,
  Pin,
  Anchor,
  Chain,
  Shuffle,
  Repeat,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Box,
  Sphere,
  Pyramid,
  Mesh,
  Stack,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  SplitSquareHorizontal,
  RectangleHorizontal,
  Gauge,
  Timer,
  Stopwatch,
  Hourglass,
  Compass,
  Navigation,
  Route,
  Map,
  Milestone,
  Mountain,
  Waves,
  Sunrise,
  Sunset,
  Eclipse,
  Rainbow,
  Umbrella,
  Tent,
  Backpack,
  Binoculars,
  Flashlight,
  Lantern,
  Candle,
  Lightbulb,
  Fan,
  Heater,
  AirVent,
  Washing,
  Iron,
  Magnet,
  Atom,
  Dna,
  Microscope,
  TestTube,
  Beaker,
  FlaskConical,
  Pill,
  Syringe,
  Bandage,
  Stethoscope,
  FirstAid,
  Virus,
  Bug,
  Zap as Lightning,
  Bolt,
  Sparkles,
  Wand2,
  MagicWand,
  Rocket,
  Plane,
  Car,
  Bike,
  Train,
  Bus,
  Boat,
  Anchor as Ship,
  Palette as Paint,
  Brush as Paintbrush2,
  Pipette,
  Swatch,
  Eyedropper,
  Crosshair,
  Focus,
  Aperture,
  Lens,
  CameraOff,
  VideoOff,
  ImageOff,
  VolumeX,
  MicOff,
  PhoneOff,
  WifiOff,
  BluetoothOff,
  BatteryLow,
  SignalLow,
  SignalHigh,
  SignalMedium,
  SignalZero,
  Antenna,
  Satellite,
  Radio as RadioWave,
  Radar,
  Sonar,
  Waves as SoundWaves,
  Vibrate,
  Power,
  PowerOff,
  Plug,
  Unplug,
  Cable,
  Ethernet,
  Router,
  Modem,
  Switch,
  Hub,
  Firewall,
  VpnConnection,
  NetworkSecure,
  NetworkUnsecure,
  CloudOff,
  CloudSync,
  CloudDownload,
  CloudUpload,
  CloudCheck,
  CloudX,
  CloudAlert,
  CloudLightning,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  CloudMoon,
  CloudDrizzle,
  CloudHail,
  CloudFog,
  Tornado,
  Hurricane,
  Cyclone,
  Earthquake,
  Volcano,
  Avalanche,
  Tsunami,
  Flood,
  Drought,
  Wildfire,
  Blizzard,
  Sandstorm,
  Heatwave,
  Coldwave,
  Aurora,
  Meteor,
  Comet,
  Asteroid,
  Satellite as Space,
  Rocket as SpaceRocket,
  Ufo,
  Alien,
  Planet,
  Moon as MoonSpace,
  Sun as SunSpace,
  Stars,
  Galaxy,
  Nebula,
  BlackHole,
  Wormhole,
  Orbit,
  Gravity,
  Magnetism,
  Radiation,
  Laser,
  Beam,
  Portal,
  Teleport,
  Invisible,
  Visible,
  Transparent,
  Opaque,
  Reflection,
  Refraction,
  Prism,
  Kaleidoscope,
  Mirror,
  Glass,
  Crystal,
  Diamond as Gem2,
  Ruby,
  Emerald,
  Sapphire,
  Pearl,
  Gold,
  Silver,
  Bronze,
  Copper,
  Iron as IronMetal,
  Steel,
  Titanium,
  Aluminum,
  Lead,
  Tin,
  Zinc,
  Nickel,
  Cobalt,
  Platinum,
  Palladium,
  Rhodium,
  Iridium,
  Osmium,
  Ruthenium,
  Rhenium,
  Tungsten,
  Molybdenum,
  Chromium,
  Vanadium,
  Manganese,
  Technetium,
  Rhenium as Re,
  Hafnium,
  Tantalum,
  Niobium,
  Zirconium,
  Yttrium,
  Scandium,
  Lanthanum,
  Cerium,
  Praseodymium,
  Neodymium,
  Promethium,
  Samarium,
  Europium,
  Gadolinium,
  Terbium,
  Dysprosium,
  Holmium,
  Erbium,
  Thulium,
  Ytterbium,
  Lutetium,
  Actinium,
  Thorium,
  Protactinium,
  Uranium,
  Neptunium,
  Plutonium,
  Americium,
  Curium,
  Berkelium,
  Californium,
  Einsteinium,
  Fermium,
  Mendelevium,
  Nobelium,
  Lawrencium,
  Rutherfordium,
  Dubnium,
  Seaborgium,
  Bohrium,
  Hassium,
  Meitnerium,
  Darmstadtium,
  Roentgenium,
  Copernicium,
  Nihonium,
  Flerovium,
  Moscovium,
  Livermorium,
  Tennessine,
  Oganesson
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ReferenceArea as RefArea,
  ReferenceLine as RefLine,
  ErrorBar,
  Sector,
  LabelProps,
  TooltipProps,
  LegendProps,
  CartesianGridProps,
  XAxisProps,
  YAxisProps,
  BarProps,
  LineProps,
  AreaProps,
  ScatterProps,
  PieProps,
  RadialBarProps,
  FunnelProps,
  TreemapProps,
  ResponsiveContainerProps,
  SectorProps,
  CellProps,
  BrushProps,
  ErrorBarProps,
  ReferenceLineProps,
  ReferenceAreaProps,
  LabelListProps
} from 'recharts'

interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  color: string
  description: string
  trend: number[]
}

interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  actions?: Array<{
    label: string
    action: () => void
  }>
}

interface RecentActivity {
  id: string
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'order' | 'rule_triggered'
  title: string
  description: string
  user: string
  timestamp: Date
  icon: React.ElementType
  color: string
}

interface ChartData {
  name: string
  value: number
  change?: number
  [key: string]: any
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<{
    metrics: DashboardMetric[]
    alerts: AlertItem[]
    recentActivity: RecentActivity[]
    chartData: {
      inventory: ChartData[]
      sales: ChartData[]
      categories: ChartData[]
      locations: ChartData[]
      trends: ChartData[]
    }
  }>({
    metrics: [],
    alerts: [],
    recentActivity: [],
    chartData: {
      inventory: [],
      sales: [],
      categories: [],
      locations: [],
      trends: []
    }
  })

  // Sample data - in real implementation, this would come from API
  const sampleMetrics: DashboardMetric[] = [
    {
      id: 'total_items',
      title: 'Total Items',
      value: '2,345',
      change: 12.5,
      changeType: 'positive',
      icon: Package,
      color: 'bg-blue-500',
      description: 'Total inventory items across all locations',
      trend: [100, 110, 95, 120, 105, 130, 125]
    },
    {
      id: 'total_value',
      title: 'Total Value',
      value: '$1.2M',
      change: 8.3,
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Total inventory value at current prices',
      trend: [80, 85, 90, 95, 100, 105, 110]
    },
    {
      id: 'low_stock',
      title: 'Low Stock Alerts',
      value: '23',
      change: -15.2,
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Items below reorder point',
      trend: [30, 28, 25, 27, 20, 18, 23]
    },
    {
      id: 'orders_pending',
      title: 'Pending Orders',
      value: '156',
      change: 5.7,
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      description: 'Orders awaiting fulfillment',
      trend: [140, 145, 150, 148, 152, 155, 156]
    },
    {
      id: 'suppliers_active',
      title: 'Active Suppliers',
      value: '89',
      change: 2.3,
      changeType: 'positive',
      icon: Building,
      color: 'bg-cyan-500',
      description: 'Currently active supplier relationships',
      trend: [85, 86, 87, 88, 87, 89, 89]
    },
    {
      id: 'turnover_rate',
      title: 'Turnover Rate',
      value: '4.2x',
      change: 18.5,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: 'Annual inventory turnover ratio',
      trend: [3.5, 3.7, 3.8, 4.0, 4.1, 4.2, 4.2]
    }
  ]

  const sampleAlerts: AlertItem[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: '23 items are below reorder point and need immediate attention',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      actions: [
        { label: 'View Items', action: () => {} },
        { label: 'Create Order', action: () => {} }
      ]
    },
    {
      id: '2',
      type: 'error',
      title: 'Overstock Detected',
      message: 'Electronics category has 150% excess inventory',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      actions: [
        { label: 'Analyze', action: () => {} },
        { label: 'Create Sale', action: () => {} }
      ]
    },
    {
      id: '3',
      type: 'success',
      title: 'ETL Process Complete',
      message: 'Successfully imported 1,234 items from supplier catalog',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      actions: [
        { label: 'View Report', action: () => {} }
      ]
    },
    {
      id: '4',
      type: 'info',
      title: 'Analytics Ready',
      message: 'New demand forecasting report is available',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      actions: [
        { label: 'View Analytics', action: () => {} }
      ]
    }
  ]

  const sampleActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'stock_in',
      title: 'Stock Received',
      description: 'Added 500 units of Widget A from Supplier XYZ',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'rule_triggered',
      title: 'Rule Triggered',
      description: 'Auto-reorder rule activated for Product B',
      user: 'System',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      icon: Zap,
      color: 'text-purple-600'
    },
    {
      id: '3',
      type: 'stock_out',
      title: 'Stock Shipped',
      description: 'Fulfilled order #ORD-2024-001 (250 units)',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      id: '4',
      type: 'adjustment',
      title: 'Inventory Adjustment',
      description: 'Cycle count adjustment for Warehouse A',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: Edit,
      color: 'text-orange-600'
    },
    {
      id: '5',
      type: 'transfer',
      title: 'Stock Transfer',
      description: 'Transferred 100 units from Warehouse A to B',
      user: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: ArrowRight,
      color: 'text-cyan-600'
    }
  ]

  const sampleChartData = {
    inventory: [
      { name: 'Jan', value: 2100, change: 5.2 },
      { name: 'Feb', value: 2200, change: 4.8 },
      { name: 'Mar', value: 2150, change: -2.3 },
      { name: 'Apr', value: 2300, change: 7.0 },
      { name: 'May', value: 2280, change: -0.9 },
      { name: 'Jun', value: 2400, change: 5.3 },
      { name: 'Jul', value: 2345, change: -2.3 }
    ],
    sales: [
      { name: 'Mon', value: 1200 },
      { name: 'Tue', value: 1900 },
      { name: 'Wed', value: 1500 },
      { name: 'Thu', value: 2200 },
      { name: 'Fri', value: 2800 },
      { name: 'Sat', value: 3200 },
      { name: 'Sun', value: 2100 }
    ],
    categories: [
      { name: 'Electronics', value: 35, color: '#3b82f6' },
      { name: 'Clothing', value: 25, color: '#10b981' },
      { name: 'Books', value: 20, color: '#f59e0b' },
      { name: 'Home & Garden', value: 15, color: '#ef4444' },
      { name: 'Sports', value: 5, color: '#8b5cf6' }
    ],
    locations: [
      { name: 'Warehouse A', value: 45, utilization: 78 },
      { name: 'Warehouse B', value: 30, utilization: 65 },
      { name: 'Store 1', value: 15, utilization: 92 },
      { name: 'Store 2', value: 10, utilization: 88 }
    ],
    trends: [
      { name: 'Week 1', inventory: 2100, sales: 1800, orders: 150 },
      { name: 'Week 2', inventory: 2200, sales: 1900, orders: 160 },
      { name: 'Week 3', inventory: 2150, sales: 2100, orders: 140 },
      { name: 'Week 4', inventory: 2300, sales: 2200, orders: 180 }
    ]
  }

  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        metrics: sampleMetrics,
        alerts: sampleAlerts,
        recentActivity: sampleActivity,
        chartData: sampleChartData
      })
      setIsLoading(false)
    }, 1000)
  }, [timeRange])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 60) {
      return `${minutes} min ago`
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'error': return XCircle
      case 'success': return CheckCircle
      case 'info': return Info
      default: return Info
    }
  }

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return 'border-orange-200 bg-orange-50 text-orange-800'
      case 'error': return 'border-red-200 bg-red-50 text-red-800'
      case 'success': return 'border-green-200 bg-green-50 text-green-800'
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p className="text-foreground font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Real-time inventory overview and system insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn-outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-responsive">
        {dashboardData.metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="metric-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`metric-change ${metric.changeType === 'positive' ? 'positive' : 'negative'}`}>
                  {metric.changeType === 'positive' ? '+' : ''}{metric.change}%
                </div>
              </div>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.title}</div>
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
            
            {/* Mini trend chart */}
            <div className="mt-4 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.trend.map((value, i) => ({ value, index: i }))}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={metric.changeType === 'positive' ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="chart-container"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="chart-title">Inventory Trends</h3>
                <p className="chart-subtitle">Monthly inventory levels and changes</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="btn-outline">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="btn-outline">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dashboardData.chartData.inventory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Items" />
                <Line yAxisId="right" type="monotone" dataKey="change" stroke="#10b981" name="Change %" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sales & Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="chart-container"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="chart-title">Weekly Performance</h3>
                <p className="chart-subtitle">Inventory, sales, and order trends</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="btn-outline">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="btn-outline">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dashboardData.chartData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inventory" fill="#3b82f6" name="Inventory" />
                <Line type="monotone" dataKey="sales" stroke="#10b981" name="Sales" />
                <Line type="monotone" dataKey="orders" stroke="#f59e0b" name="Orders" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="chart-container"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="chart-title">Category Distribution</h3>
                <p className="chart-subtitle">Inventory breakdown by category</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="btn-outline">
                  <PieChart className="w-4 h-4" />
                </button>
                <button className="btn-outline">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={dashboardData.chartData.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.chartData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-lg p-6 border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Alerts</h3>
              <button className="btn-outline">
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type)
                return (
                  <div key={alert.id} className={`alert ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-75">{formatTimeAgo(alert.timestamp)}</p>
                        {alert.actions && (
                          <div className="flex items-center space-x-2 mt-3">
                            {alert.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className="text-xs font-medium hover:underline"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card rounded-lg p-6 border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <button className="btn-outline">
                <Activity className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location Utilization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card rounded-lg p-6 border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Location Utilization</h3>
              <button className="btn-outline">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.chartData.locations.map((location) => (
                <div key={location.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{location.name}</span>
                    <span className="text-sm text-muted-foreground">{location.utilization}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${location.utilization}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{location.value}% of total inventory</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-lg p-6 border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-outline flex-col h-16 space-y-1">
                <Plus className="w-5 h-5" />
                <span className="text-xs">Add Item</span>
              </button>
              <button className="btn-outline flex-col h-16 space-y-1">
                <Upload className="w-5 h-5" />
                <span className="text-xs">Import</span>
              </button>
              <button className="btn-outline flex-col h-16 space-y-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">Analytics</span>
              </button>
              <button className="btn-outline flex-col h-16 space-y-1">
                <Settings className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Machine learning recommendations</p>
            </div>
          </div>
          <button className="btn-primary">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-foreground">Demand Forecast</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Electronics category expected to increase by 23% next month
            </p>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-foreground">Optimization</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Reorder point adjustment could reduce stockouts by 15%
            </p>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-foreground">Anomaly Detection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Unusual pattern detected in Warehouse B stock levels
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard