import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Zap,
  Brain,
  Eye,
  Download,
  Share2,
  Settings,
  Filter,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Package,
  DollarSign,
  ShoppingCart,
  Building,
  MapPin,
  Users,
  Truck,
  Warehouse,
  Tag,
  Hash,
  Percent,
  Calculator,
  Database,
  Cloud,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Shield,
  Lock,
  Globe,
  Search,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  MoreHorizontal,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCcw,
  FlipHorizontal,
  Move,
  Crop,
  Palette,
  Brush as BrushIcon,
  Pen,
  Eraser,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Grid,
  Table,
  Columns,
  Rows,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  SplitSquareHorizontal,
  RectangleHorizontal,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Flag,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Camera,
  Mic,
  Speaker,
  Volume2,
  Bell,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Monitor,
  Server,
  Bluetooth,
  Headphones,
  Radio,
  Tv,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  File,
  Folder,
  Save,
  Upload,
  Image,
  Music,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  VolumeUp,
  VolumeDown,
  Mute,
  Rss,
  Podcast,
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
  Coffee,
  Pizza,
  Utensils,
  Hammer,
  Wrench,
  Ruler,
  Scissors,
  Paperclip,
  Pin,
  Anchor,
  Chain,
  Key,
  Unlock,
  UserCheck,
  Crown,
  Gem,
  Diamond,
  Smile,
  Laugh,
  Navigation,
  Compass,
  Map,
  Route,
  Milestone,
  Mountain,
  Waves,
  Sunrise,
  Umbrella,
  Tent,
  Backpack,
  Binoculars,
  Flashlight,
  Candle,
  Lightbulb,
  Fan,
  AirVent,
  Magnet,
  Atom,
  Dna,
  Microscope,
  TestTube,
  Beaker,
  Pill,
  Syringe,
  Bandage,
  Stethoscope,
  Virus,
  Bug,
  Rocket,
  Plane,
  Car,
  Bike,
  Train,
  Bus,
  Boat
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
  Pie,
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
  ErrorBar
} from 'recharts'

interface AnalyticsMetric {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  trend: number[]
  icon: React.ElementType
  color: string
  description: string
  target?: number
  unit?: string
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface Insight {
  id: string
  type: 'forecast' | 'anomaly' | 'optimization' | 'alert' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  action?: string
  data?: any
  createdAt: Date
}

interface ForecastData {
  period: string
  actual?: number
  forecast: number
  confidence_lower: number
  confidence_upper: number
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'insights' | 'reports' | 'alerts'>('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['inventory_value', 'turnover_rate', 'stockouts', 'demand_forecast'])
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<{
    metrics: AnalyticsMetric[]
    insights: Insight[]
    chartData: {
      inventory_trends: ChartData[]
      sales_performance: ChartData[]
      category_analysis: ChartData[]
      location_performance: ChartData[]
      forecast_data: ForecastData[]
      abc_analysis: ChartData[]
      turnover_analysis: ChartData[]
      demand_patterns: ChartData[]
    }
  }>({
    metrics: [],
    insights: [],
    chartData: {
      inventory_trends: [],
      sales_performance: [],
      category_analysis: [],
      location_performance: [],
      forecast_data: [],
      abc_analysis: [],
      turnover_analysis: [],
      demand_patterns: []
    }
  })

  // Sample analytics data
  const sampleMetrics: AnalyticsMetric[] = [
    {
      id: 'inventory_value',
      title: 'Inventory Value',
      value: '$1.24M',
      change: 8.5,
      changeType: 'positive',
      trend: [1.1, 1.15, 1.12, 1.18, 1.20, 1.22, 1.24],
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Total value of current inventory',
      target: 1.3,
      unit: 'M'
    },
    {
      id: 'turnover_rate',
      title: 'Inventory Turnover',
      value: '4.2x',
      change: 12.3,
      changeType: 'positive',
      trend: [3.8, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2],
      icon: RotateCcw,
      color: 'bg-blue-500',
      description: 'Annual inventory turnover ratio',
      target: 5.0,
      unit: 'x'
    },
    {
      id: 'stockout_rate',
      title: 'Stockout Rate',
      value: '2.3%',
      change: -23.5,
      changeType: 'positive',
      trend: [3.2, 3.0, 2.8, 2.5, 2.4, 2.3, 2.3],
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Percentage of items out of stock',
      target: 2.0,
      unit: '%'
    },
    {
      id: 'demand_accuracy',
      title: 'Forecast Accuracy',
      value: '87.5%',
      change: 5.2,
      changeType: 'positive',
      trend: [82, 83, 85, 86, 87, 87, 87.5],
      icon: Target,
      color: 'bg-purple-500',
      description: 'ML demand forecasting accuracy',
      target: 90.0,
      unit: '%'
    },
    {
      id: 'carrying_cost',
      title: 'Carrying Cost',
      value: '$156K',
      change: -8.7,
      changeType: 'positive',
      trend: [170, 168, 165, 160, 158, 156, 156],
      icon: Calculator,
      color: 'bg-red-500',
      description: 'Monthly inventory carrying costs',
      target: 150,
      unit: 'K'
    },
    {
      id: 'order_fill_rate',
      title: 'Order Fill Rate',
      value: '94.2%',
      change: 3.1,
      changeType: 'positive',
      trend: [91, 92, 93, 93.5, 94, 94.1, 94.2],
      icon: CheckCircle,
      color: 'bg-cyan-500',
      description: 'Percentage of orders fulfilled completely',
      target: 95.0,
      unit: '%'
    }
  ]

  const sampleInsights: Insight[] = [
    {
      id: '1',
      type: 'forecast',
      title: 'Demand Surge Predicted',
      description: 'Electronics category expected to see 35% increase in demand over next 2 weeks due to seasonal trends',
      impact: 'high',
      confidence: 92,
      action: 'Increase stock levels for top electronics items',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Unusual Stock Movement',
      description: 'Product SKU-12345 showing 300% higher than normal consumption rate in Warehouse B',
      impact: 'medium',
      confidence: 87,
      action: 'Investigate potential inventory discrepancy',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Reorder Point Optimization',
      description: 'Adjusting reorder points for 156 items could reduce stockouts by 23% while maintaining service level',
      impact: 'high',
      confidence: 94,
      action: 'Apply suggested reorder point changes',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'ABC Analysis Update',
      description: '23 items have shifted categories based on recent sales data. Consider adjusting inventory strategies',
      impact: 'medium',
      confidence: 89,
      action: 'Review and update ABC classifications',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ]

  const sampleChartData = {
    inventory_trends: [
      { name: 'Jan', value: 2100, cost: 180, turnover: 3.8 },
      { name: 'Feb', value: 2200, cost: 175, turnover: 3.9 },
      { name: 'Mar', value: 2150, cost: 170, turnover: 4.0 },
      { name: 'Apr', value: 2300, cost: 165, turnover: 4.1 },
      { name: 'May', value: 2280, cost: 160, turnover: 4.1 },
      { name: 'Jun', value: 2400, cost: 158, turnover: 4.2 },
      { name: 'Jul', value: 2345, cost: 156, turnover: 4.2 }
    ],
    sales_performance: [
      { name: 'Week 1', sales: 45000, orders: 234, avg_order: 192 },
      { name: 'Week 2', sales: 52000, orders: 267, avg_order: 195 },
      { name: 'Week 3', sales: 48000, orders: 245, avg_order: 196 },
      { name: 'Week 4', sales: 55000, orders: 278, avg_order: 198 },
      { name: 'Week 5', sales: 58000, orders: 289, avg_order: 201 }
    ],
    category_analysis: [
      { name: 'Electronics', value: 45, revenue: 450000, margin: 25, items: 234 },
      { name: 'Clothing', value: 30, revenue: 320000, margin: 35, items: 567 },
      { name: 'Books', value: 15, revenue: 180000, margin: 40, items: 890 },
      { name: 'Home & Garden', value: 8, revenue: 120000, margin: 30, items: 345 },
      { name: 'Sports', value: 2, revenue: 45000, margin: 28, items: 123 }
    ],
    location_performance: [
      { name: 'Warehouse A', efficiency: 94, utilization: 78, throughput: 1250 },
      { name: 'Warehouse B', efficiency: 91, utilization: 65, throughput: 980 },
      { name: 'Store 1', efficiency: 88, utilization: 92, throughput: 340 },
      { name: 'Store 2', efficiency: 85, utilization: 88, throughput: 290 },
      { name: 'Store 3', efficiency: 92, utilization: 76, throughput: 380 }
    ],
    forecast_data: [
      { period: 'Aug', actual: 2345, forecast: 2380, confidence_lower: 2320, confidence_upper: 2440 },
      { period: 'Sep', forecast: 2420, confidence_lower: 2350, confidence_upper: 2490 },
      { period: 'Oct', forecast: 2380, confidence_lower: 2300, confidence_upper: 2460 },
      { period: 'Nov', forecast: 2550, confidence_lower: 2450, confidence_upper: 2650 },
      { period: 'Dec', forecast: 2890, confidence_lower: 2750, confidence_upper: 3030 }
    ],
    abc_analysis: [
      { category: 'A Items', count: 234, value_percent: 70, quantity_percent: 15 },
      { category: 'B Items', count: 567, value_percent: 25, quantity_percent: 25 },
      { category: 'C Items', count: 1234, value_percent: 5, quantity_percent: 60 }
    ],
    turnover_analysis: [
      { range: '0-1x', count: 45, percentage: 8 },
      { range: '1-2x', count: 123, percentage: 22 },
      { range: '2-4x', count: 234, percentage: 42 },
      { range: '4-6x', count: 134, percentage: 24 },
      { range: '6+x', count: 23, percentage: 4 }
    ],
    demand_patterns: [
      { day: 'Mon', pattern: 85, seasonal: 92 },
      { day: 'Tue', pattern: 78, seasonal: 88 },
      { day: 'Wed', pattern: 82, seasonal: 90 },
      { day: 'Thu', pattern: 88, seasonal: 95 },
      { day: 'Fri', pattern: 95, seasonal: 102 },
      { day: 'Sat', pattern: 120, seasonal: 125 },
      { day: 'Sun', pattern: 75, seasonal: 80 }
    ]
  }

  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        metrics: sampleMetrics,
        insights: sampleInsights,
        chartData: sampleChartData
      })
      setIsLoading(false)
    }, 1000)
  }, [timeRange])

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'forecast': return TrendingUp
      case 'anomaly': return AlertTriangle
      case 'optimization': return Target
      case 'alert': return Bell
      case 'recommendation': return Lightbulb
      default: return Info
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'forecast': return 'text-blue-600'
      case 'anomaly': return 'text-orange-600'
      case 'optimization': return 'text-green-600'
      case 'alert': return 'text-red-600'
      case 'recommendation': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getImpactBadge = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high': return 'status-badge error'
      case 'medium': return 'status-badge warning'
      case 'low': return 'status-badge info'
      default: return 'status-badge info'
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p className="text-foreground font-medium">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Analytics & Insights</h1>
          <p className="section-subtitle">
            AI-powered analytics with machine learning insights and demand forecasting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn-outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn-outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData.metrics.map((metric, index) => (
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
                {metric.target && (
                  <div className="text-xs text-muted-foreground">
                    Target: {metric.target}{metric.unit}
                  </div>
                )}
              </div>
            </div>
            
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.title}</div>
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
            
            {/* Progress bar for target metrics */}
            {metric.target && (
              <div className="mt-3">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (parseFloat(metric.value.toString().replace(/[^0-9.]/g, '')) / metric.target) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Mini trend chart */}
            <div className="mt-4 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={metric.trend.map((value, i) => ({ value, index: i }))}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={metric.changeType === 'positive' ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="tab-list">
        {['overview', 'forecasting', 'insights', 'reports', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Trends */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">Inventory Trends</h3>
                    <p className="chart-subtitle">Value, costs, and turnover over time</p>
                  </div>
                  <button className="btn-outline">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.chartData.inventory_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Inventory Items" />
                    <Line yAxisId="right" type="monotone" dataKey="turnover" stroke="#10b981" name="Turnover Rate" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Category Analysis */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">Category Performance</h3>
                    <p className="chart-subtitle">Revenue and margin by category</p>
                  </div>
                  <button className="btn-outline">
                    <PieChart className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.chartData.category_analysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" name="Margin %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* ABC Analysis */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">ABC Analysis</h3>
                    <p className="chart-subtitle">Inventory classification by value</p>
                  </div>
                  <button className="btn-outline">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.chartData.abc_analysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value_percent" fill="#ef4444" name="Value %" />
                    <Bar dataKey="quantity_percent" fill="#06b6d4" name="Quantity %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Location Performance */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">Location Performance</h3>
                    <p className="chart-subtitle">Efficiency and utilization by location</p>
                  </div>
                  <button className="btn-outline">
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.chartData.location_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
                    <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
                    <Line type="monotone" dataKey="throughput" stroke="#f59e0b" name="Throughput" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Turnover Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">Turnover Distribution</h3>
                    <p className="chart-subtitle">Items by turnover rate ranges</p>
                  </div>
                  <button className="btn-outline">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.chartData.turnover_analysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                    >
                      {analyticsData.chartData.turnover_analysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="chart-title">Demand Patterns</h3>
                    <p className="chart-subtitle">Weekly demand patterns vs seasonal trends</p>
                  </div>
                  <button className="btn-outline">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analyticsData.chartData.demand_patterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pattern" fill="#8b5cf6" name="Current Pattern" />
                    <Line type="monotone" dataKey="seasonal" stroke="#f59e0b" name="Seasonal Trend" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Forecasting Tab */}
        {activeTab === 'forecasting' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Demand Forecasting</h3>
              <div className="flex items-center space-x-3">
                <button className="btn-outline">
                  <Brain className="w-4 h-4 mr-2" />
                  ML Settings
                </button>
                <button className="btn-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Forecast
                </button>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="chart-container">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="chart-title">Inventory Forecast</h3>
                  <p className="chart-subtitle">6-month demand prediction with confidence intervals</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Accuracy: 87.5%</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analyticsData.chartData.forecast_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    dataKey="confidence_upper" 
                    stackId="1" 
                    stroke="none" 
                    fill="#3b82f6" 
                    fillOpacity={0.1} 
                    name="Confidence Upper"
                  />
                  <Area 
                    dataKey="confidence_lower" 
                    stackId="1" 
                    stroke="none" 
                    fill="white" 
                    name="Confidence Lower"
                  />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" name="Forecast" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="metric-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="metric-value">87.5%</div>
                    <div className="metric-label">Accuracy</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">ML model prediction accuracy</p>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="metric-value">+23%</div>
                    <div className="metric-label">Next Month</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Predicted demand increase</p>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="metric-value">2.3h</div>
                    <div className="metric-label">Update Time</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Model training duration</p>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="metric-value">2.4M</div>
                    <div className="metric-label">Data Points</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Historical data used for training</p>
              </div>
            </div>

            {/* Model Performance */}
            <div className="bg-card rounded-lg p-6 border">
              <h4 className="font-medium text-foreground mb-4">Model Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mean Absolute Error</span>
                    <span className="text-sm font-medium text-foreground">5.2%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-green-500" style={{ width: '94.8%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Root Mean Square Error</span>
                    <span className="text-sm font-medium text-foreground">7.8%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-blue-500" style={{ width: '92.2%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mean Absolute Percentage Error</span>
                    <span className="text-sm font-medium text-foreground">12.5%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-purple-500" style={{ width: '87.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
              <button className="btn-primary">
                <Brain className="w-4 h-4 mr-2" />
                Generate New Insights
              </button>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {analyticsData.insights.map((insight) => {
                const InsightIcon = getInsightIcon(insight.type)
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInsightColor(insight.type)} bg-muted`}>
                          <InsightIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${getImpactBadge(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    {insight.action && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-foreground font-medium">
                          Recommended Action: {insight.action}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button className="btn-outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </button>
                          <button className="btn-primary">
                            <Check className="w-4 h-4 mr-2" />
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Analytics Reports</h3>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </button>
            </div>

            {/* Report Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Inventory Summary', description: 'Complete overview of current inventory status', icon: Package },
                { name: 'Performance Analysis', description: 'Detailed performance metrics and trends', icon: BarChart3 },
                { name: 'Forecast Report', description: 'Demand forecasting and predictions', icon: TrendingUp },
                { name: 'ABC Analysis', description: 'Product categorization by value and movement', icon: Target },
                { name: 'Cost Analysis', description: 'Carrying costs and optimization opportunities', icon: DollarSign },
                { name: 'Turnover Report', description: 'Inventory turnover rates and efficiency', icon: RotateCcw }
              ].map((report, index) => (
                <motion.div
                  key={report.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <report.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last updated: 2 hours ago</span>
                    <div className="flex items-center space-x-1">
                      <button className="btn-outline">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn-outline">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scheduled Reports */}
            <div className="bg-card rounded-lg p-6 border">
              <h4 className="font-medium text-foreground mb-4">Scheduled Reports</h4>
              <div className="space-y-3">
                {[
                  { name: 'Daily Inventory Report', schedule: 'Daily at 6:00 AM', format: 'PDF', status: 'active' },
                  { name: 'Weekly Performance Summary', schedule: 'Every Monday', format: 'Excel', status: 'active' },
                  { name: 'Monthly Analytics', schedule: 'First day of month', format: 'PDF', status: 'paused' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">{report.name}</p>
                        <p className="text-sm text-muted-foreground">{report.schedule} • {report.format}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge ${report.status === 'active' ? 'success' : 'warning'}`}>
                        {report.status}
                      </span>
                      <button className="btn-outline">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Analytics Alerts</h3>
              <div className="flex items-center space-x-3">
                <button className="btn-outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Alert Settings
                </button>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </button>
              </div>
            </div>

            {/* Alert Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'Threshold Alerts', count: 5, icon: AlertTriangle, color: 'text-orange-600' },
                { name: 'Anomaly Detection', count: 2, icon: Activity, color: 'text-red-600' },
                { name: 'Forecast Alerts', count: 3, icon: TrendingUp, color: 'text-blue-600' },
                { name: 'Performance Alerts', count: 1, icon: Target, color: 'text-green-600' }
              ].map((category) => (
                <div key={category.name} className="metric-card">
                  <div className="flex items-center space-x-3">
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                    <div>
                      <div className="metric-value">{category.count}</div>
                      <div className="metric-label">{category.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Alerts */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Active Alerts</h4>
              {[
                {
                  type: 'threshold',
                  title: 'Low Stock Threshold Exceeded',
                  message: '23 items have fallen below their reorder points',
                  severity: 'high',
                  time: '5 minutes ago'
                },
                {
                  type: 'anomaly',
                  title: 'Unusual Demand Pattern',
                  message: 'Electronics category showing 200% higher than expected demand',
                  severity: 'medium',
                  time: '1 hour ago'
                },
                {
                  type: 'forecast',
                  title: 'Forecast Accuracy Drop',
                  message: 'Model accuracy decreased to 82% for clothing category',
                  severity: 'medium',
                  time: '3 hours ago'
                },
                {
                  type: 'performance',
                  title: 'Turnover Rate Improvement',
                  message: 'Overall inventory turnover improved by 15% this month',
                  severity: 'low',
                  time: '6 hours ago'
                }
              ].map((alert, index) => (
                <div key={index} className={`alert ${alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'success'}`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-75">{alert.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn-outline">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn-outline">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ML Model Status Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Machine Learning Engine</h3>
              <p className="text-sm text-muted-foreground">Real-time analytics and predictive insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground">Active</span>
            </div>
            <button className="btn-primary">
              <Settings className="w-4 h-4 mr-2" />
              Configure ML
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-foreground">Demand Forecasting</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              87.5% accuracy with deep learning models
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-foreground">Anomaly Detection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time monitoring with 99.2% precision
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-foreground">Auto-Optimization</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Intelligent reorder point and quantity suggestions
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-foreground">Performance Insights</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Automated recommendations and action items
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics