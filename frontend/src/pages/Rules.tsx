import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Target,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Code,
  Database,
  Bell,
  Mail,
  MessageSquare,
  Webhook,
  GitBranch,
  Layers,
  Calendar,
  User,
  Users,
  Building,
  Package,
  Tag,
  Hash,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Brain,
  Shield,
  Lock,
  Key,
  Globe,
  Cloud,
  Server,
  Cpu,
  Memory,
  HardDrive,
  Network,
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
  Share2,
  ExternalLink,
  Link,
  Paperclip,
  Pin,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  Flag,
  Award,
  Crown,
  Gem,
  Diamond,
  Circle,
  Square as SquareIcon,
  Triangle,
  Hexagon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronLeft,
  MoreHorizontal,
  X,
  Check,
  Info,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Wand2,
  Magic,
  Rocket,
  Flame,
  Lightning,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Snowflake,
  TreePine,
  Flower,
  Coffee,
  Pizza,
  Utensils,
  Hammer,
  Wrench,
  Ruler,
  Scissors,
  Brush,
  Palette,
  Pen,
  Pencil,
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
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCcw,
  FlipHorizontal,
  Move,
  Crop,
  Focus,
  Aperture,
  Lens,
  Crosshair,
  Navigation,
  Compass,
  Map,
  MapPin,
  Route,
  Milestone,
  Mountain,
  Waves,
  Umbrella,
  Tent,
  Backpack,
  Binoculars,
  Flashlight,
  Candle,
  Lightbulb as LightIcon,
  Fan,
  Heater,
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
  Plane,
  Car,
  Bike,
  Train,
  Bus,
  Boat,
  Anchor,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Radio,
  Headphones,
  Speaker,
  Gamepad2,
  Joystick,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Phone,
  Voicemail,
  Rss,
  Podcast,
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
  Mute
} from 'lucide-react'

interface Rule {
  id: string
  name: string
  description: string
  type: 'validation' | 'transformation' | 'business_logic' | 'alert' | 'automation'
  status: 'active' | 'inactive' | 'draft' | 'error'
  priority: number
  conditions: RuleCondition[]
  actions: RuleAction[]
  trigger: 'manual' | 'automatic' | 'scheduled' | 'event'
  schedule?: string
  lastExecuted?: Date
  executionCount: number
  successRate: number
  averageExecutionTime: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface RuleCondition {
  id: string
  field: string
  operator: string
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface RuleAction {
  id: string
  type: 'update' | 'alert' | 'email' | 'webhook' | 'function'
  config: any
  order: number
}

interface RuleExecution {
  id: string
  ruleId: string
  status: 'success' | 'failed' | 'running'
  startTime: Date
  endTime?: Date
  duration?: number
  recordsProcessed: number
  recordsAffected: number
  errors: string[]
  result: any
}

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  template: Partial<Rule>
  isPopular: boolean
  usageCount: number
}

const Rules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates' | 'analytics'>('rules')
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [executions, setExecutions] = useState<RuleExecution[]>([])
  const [templates, setTemplates] = useState<RuleTemplate[]>([])
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  })

  // Sample data
  const sampleRules: Rule[] = [
    {
      id: '1',
      name: 'Auto-Reorder Low Stock Items',
      description: 'Automatically generate purchase orders when items fall below reorder point',
      type: 'automation',
      status: 'active',
      priority: 1,
      conditions: [
        {
          id: '1',
          field: 'quantity',
          operator: '<=',
          value: 'reorder_point'
        },
        {
          id: '2',
          field: 'status',
          operator: '==',
          value: 'active',
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'function',
          config: { function: 'create_purchase_order', auto_approve: false },
          order: 1
        },
        {
          id: '2',
          type: 'alert',
          config: { message: 'Purchase order created for {item_name}', channels: ['email', 'dashboard'] },
          order: 2
        }
      ],
      trigger: 'automatic',
      lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      executionCount: 145,
      successRate: 98.6,
      averageExecutionTime: 1.2,
      createdBy: 'System Admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['inventory', 'automation', 'purchasing']
    },
    {
      id: '2',
      name: 'Price Validation Rule',
      description: 'Validate that product prices are within acceptable ranges',
      type: 'validation',
      status: 'active',
      priority: 2,
      conditions: [
        {
          id: '1',
          field: 'price',
          operator: '>',
          value: 0
        },
        {
          id: '2',
          field: 'price',
          operator: '<',
          value: 'cost * 10',
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'alert',
          config: { 
            message: 'Invalid price detected for {item_name}: ${price}',
            severity: 'error',
            channels: ['email', 'dashboard']
          },
          order: 1
        }
      ],
      trigger: 'automatic',
      lastExecuted: new Date(Date.now() - 30 * 60 * 1000),
      executionCount: 2346,
      successRate: 99.9,
      averageExecutionTime: 0.3,
      createdBy: 'John Doe',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ['validation', 'pricing', 'quality']
    },
    {
      id: '3',
      name: 'Category Auto-Assignment',
      description: 'Automatically assign products to categories based on name and attributes',
      type: 'transformation',
      status: 'active',
      priority: 3,
      conditions: [
        {
          id: '1',
          field: 'category',
          operator: '==',
          value: null
        }
      ],
      actions: [
        {
          id: '1',
          type: 'function',
          config: { 
            function: 'classify_product',
            ml_model: 'category_classifier_v2',
            confidence_threshold: 0.8
          },
          order: 1
        }
      ],
      trigger: 'automatic',
      lastExecuted: new Date(Date.now() - 45 * 60 * 1000),
      executionCount: 567,
      successRate: 87.3,
      averageExecutionTime: 2.1,
      createdBy: 'Jane Smith',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['ml', 'categorization', 'automation']
    },
    {
      id: '4',
      name: 'Overstock Alert',
      description: 'Send alerts when inventory levels exceed maximum stock thresholds',
      type: 'alert',
      status: 'active',
      priority: 4,
      conditions: [
        {
          id: '1',
          field: 'quantity',
          operator: '>',
          value: 'max_stock'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'email',
          config: { 
            recipients: ['manager@company.com'],
            subject: 'Overstock Alert: {item_name}',
            template: 'overstock_alert'
          },
          order: 1
        },
        {
          id: '2',
          type: 'alert',
          config: { 
            message: 'Overstock detected: {item_name} ({quantity} units)',
            severity: 'warning'
          },
          order: 2
        }
      ],
      trigger: 'automatic',
      lastExecuted: new Date(Date.now() - 3 * 60 * 60 * 1000),
      executionCount: 89,
      successRate: 100,
      averageExecutionTime: 0.8,
      createdBy: 'Mike Johnson',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['alerts', 'inventory', 'management']
    },
    {
      id: '5',
      name: 'Seasonal Demand Adjustment',
      description: 'Adjust reorder points based on seasonal demand patterns',
      type: 'business_logic',
      status: 'inactive',
      priority: 5,
      conditions: [
        {
          id: '1',
          field: 'season',
          operator: '==',
          value: 'high_demand'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'update',
          config: { 
            field: 'reorder_point',
            formula: 'reorder_point * seasonal_multiplier'
          },
          order: 1
        }
      ],
      trigger: 'scheduled',
      schedule: '0 0 1 * *', // Monthly
      lastExecuted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      executionCount: 12,
      successRate: 91.7,
      averageExecutionTime: 45.2,
      createdBy: 'Sarah Wilson',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      tags: ['seasonal', 'demand', 'optimization']
    }
  ]

  const sampleExecutions: RuleExecution[] = [
    {
      id: '1',
      ruleId: '1',
      status: 'success',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000),
      duration: 30,
      recordsProcessed: 2345,
      recordsAffected: 23,
      errors: [],
      result: { orders_created: 23, total_value: 45600 }
    },
    {
      id: '2',
      ruleId: '2',
      status: 'success',
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 30 * 60 * 1000 + 5 * 1000),
      duration: 5,
      recordsProcessed: 1234,
      recordsAffected: 0,
      errors: [],
      result: { validation_passed: 1234, validation_failed: 0 }
    },
    {
      id: '3',
      ruleId: '3',
      status: 'failed',
      startTime: new Date(Date.now() - 45 * 60 * 1000),
      endTime: new Date(Date.now() - 45 * 60 * 1000 + 60 * 1000),
      duration: 60,
      recordsProcessed: 56,
      recordsAffected: 12,
      errors: ['ML model timeout', 'Classification confidence below threshold for 5 items'],
      result: { classified: 12, failed: 5 }
    }
  ]

  const sampleTemplates: RuleTemplate[] = [
    {
      id: '1',
      name: 'Low Stock Alert',
      description: 'Send notifications when items fall below reorder point',
      category: 'Inventory Management',
      template: {
        type: 'alert',
        conditions: [
          { id: '1', field: 'quantity', operator: '<=', value: 'reorder_point' }
        ],
        actions: [
          { 
            id: '1', 
            type: 'alert', 
            config: { 
              message: 'Low stock alert for {item_name}',
              severity: 'warning'
            },
            order: 1
          }
        ]
      },
      isPopular: true,
      usageCount: 156
    },
    {
      id: '2',
      name: 'Price Change Approval',
      description: 'Require approval for price changes above threshold',
      category: 'Pricing',
      template: {
        type: 'business_logic',
        conditions: [
          { id: '1', field: 'price_change_percent', operator: '>', value: 10 }
        ],
        actions: [
          { 
            id: '1', 
            type: 'function', 
            config: { 
              function: 'require_approval',
              approvers: ['manager@company.com']
            },
            order: 1
          }
        ]
      },
      isPopular: true,
      usageCount: 89
    },
    {
      id: '3',
      name: 'Data Quality Check',
      description: 'Validate required fields and data formats',
      category: 'Data Quality',
      template: {
        type: 'validation',
        conditions: [
          { id: '1', field: 'name', operator: '!=', value: null },
          { id: '2', field: 'sku', operator: 'matches', value: '^[A-Z]{3}-[0-9]{4}$', logicalOperator: 'AND' }
        ],
        actions: [
          { 
            id: '1', 
            type: 'alert', 
            config: { 
              message: 'Data quality issue detected in {item_name}',
              severity: 'error'
            },
            order: 1
          }
        ]
      },
      isPopular: false,
      usageCount: 34
    }
  ]

  useEffect(() => {
    setRules(sampleRules)
    setExecutions(sampleExecutions)
    setTemplates(sampleTemplates)
  }, [])

  const getRuleStatusIcon = (status: Rule['status']) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return Pause
      case 'draft': return Edit
      case 'error': return XCircle
      default: return Clock
    }
  }

  const getRuleStatusColor = (status: Rule['status']) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'inactive': return 'text-gray-600'
      case 'draft': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRuleTypeIcon = (type: Rule['type']) => {
    switch (type) {
      case 'validation': return Shield
      case 'transformation': return GitBranch
      case 'business_logic': return Brain
      case 'alert': return Bell
      case 'automation': return Zap
      default: return Settings
    }
  }

  const getExecutionStatusIcon = (status: RuleExecution['status']) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'failed': return XCircle
      case 'running': return Activity
      default: return Clock
    }
  }

  const getExecutionStatusColor = (status: RuleExecution['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const filteredRules = rules.filter(rule => {
    if (filters.status && rule.status !== filters.status) return false
    if (filters.type && rule.type !== filters.type) return false
    if (filters.search && !rule.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !rule.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const handleRunRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/rules/${ruleId}/execute`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to execute rule')
      }
      
      const result = await response.json()
      console.log('Rule execution started:', result)
      
      // Refresh executions list
      // In real implementation, you might want to poll for status updates
      
    } catch (error) {
      console.error('Error executing rule:', error)
    }
  }

  const handleToggleRule = async (ruleId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update rule')
      }
      
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, status: newStatus } : rule
      ))
      
    } catch (error) {
      console.error('Error updating rule:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Rules Engine</h1>
          <p className="section-subtitle">
            AI-powered business rules for intelligent inventory automation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Rules
          </button>
          <button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export Rules
          </button>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="btn-outline"
          >
            <Layers className="w-4 h-4 mr-2" />
            Templates
          </button>
          <button
            onClick={() => setIsCreatingRule(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">{rules.filter(r => r.status === 'active').length}</div>
              <div className="metric-label">Active Rules</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">
                {executions.filter(e => e.status === 'success').length}
              </div>
              <div className="metric-label">Executions Today</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">96.8%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">1.2s</div>
              <div className="metric-label">Avg Execution</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-list">
        {['rules', 'executions', 'templates', 'analytics'].map((tab) => (
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
      <div className="bg-card rounded-lg border p-6">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 input-field"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="error">Error</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="validation">Validation</option>
                <option value="transformation">Transformation</option>
                <option value="business_logic">Business Logic</option>
                <option value="alert">Alert</option>
                <option value="automation">Automation</option>
              </select>
              <button className="btn-outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </button>
            </div>

            {/* Rules List */}
            <div className="space-y-4">
              {filteredRules.map((rule) => {
                const StatusIcon = getRuleStatusIcon(rule.status)
                const TypeIcon = getRuleTypeIcon(rule.type)
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-5 h-5 ${getRuleStatusColor(rule.status)}`} />
                          <TypeIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${rule.status}`}>
                          {rule.status}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Priority {rule.priority}
                        </span>
                        <button
                          onClick={() => handleRunRule(rule.id)}
                          className="btn-outline"
                          disabled={rule.status !== 'active'}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleRule(
                            rule.id, 
                            rule.status === 'active' ? 'inactive' : 'active'
                          )}
                          className="btn-outline"
                        >
                          {rule.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button className="btn-outline">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rule Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="text-foreground font-medium capitalize">
                          {rule.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trigger</p>
                        <p className="text-foreground font-medium capitalize">{rule.trigger}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Executions</p>
                        <p className="text-foreground font-medium">{rule.executionCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="text-foreground font-medium">{rule.successRate}%</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center space-x-2">
                      {rule.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Conditions & Actions Preview */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-2">Conditions ({rule.conditions.length})</p>
                        <div className="bg-muted/30 rounded p-2 space-y-1">
                          {rule.conditions.slice(0, 2).map((condition) => (
                            <div key={condition.id} className="text-foreground">
                              {condition.field} {condition.operator} {condition.value}
                            </div>
                          ))}
                          {rule.conditions.length > 2 && (
                            <div className="text-muted-foreground">
                              +{rule.conditions.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2">Actions ({rule.actions.length})</p>
                        <div className="bg-muted/30 rounded p-2 space-y-1">
                          {rule.actions.slice(0, 2).map((action) => (
                            <div key={action.id} className="text-foreground">
                              {action.type}: {JSON.stringify(action.config).slice(0, 50)}...
                            </div>
                          ))}
                          {rule.actions.length > 2 && (
                            <div className="text-muted-foreground">
                              +{rule.actions.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Rule Executions</h3>
              <button className="btn-outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {/* Executions List */}
            <div className="space-y-4">
              {executions.map((execution) => {
                const StatusIcon = getExecutionStatusIcon(execution.status)
                const rule = rules.find(r => r.id === execution.ruleId)
                return (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${getExecutionStatusColor(execution.status)}`} />
                        <div>
                          <h4 className="font-medium text-foreground">{rule?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Started {execution.startTime.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${execution.status}`}>
                          {execution.status}
                        </span>
                        <button className="btn-outline">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="text-foreground font-medium">
                          {execution.duration ? `${execution.duration}s` : 'Running...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records Processed</p>
                        <p className="text-foreground font-medium">
                          {execution.recordsProcessed.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records Affected</p>
                        <p className="text-foreground font-medium">
                          {execution.recordsAffected.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="text-foreground font-medium">{execution.errors.length}</p>
                      </div>
                    </div>

                    {execution.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                        <div className="space-y-1">
                          {execution.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {execution.result && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-foreground mb-2">Result:</p>
                        <div className="text-sm bg-muted/30 p-2 rounded">
                          <pre>{JSON.stringify(execution.result, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Rule Templates</h3>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>

            {/* Template Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(
                templates.reduce((acc, template) => {
                  if (!acc[template.category]) {
                    acc[template.category] = []
                  }
                  acc[template.category].push(template)
                  return acc
                }, {} as Record<string, typeof templates>)
              ).map(([category, categoryTemplates]) => (
                <div key={category} className="space-y-4">
                  <h4 className="font-medium text-foreground">{category}</h4>
                  <div className="space-y-3">
                    {categoryTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-foreground">{template.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          {template.isPopular && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Used {template.usageCount} times
                          </span>
                          <button className="btn-outline">
                            <Plus className="w-3 h-3 mr-1" />
                            Use
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Rules Analytics</h3>
              <button className="btn-outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="metric-card">
                <h4 className="font-medium text-foreground mb-4">Execution Trends</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <span className="text-sm font-medium text-foreground">45 executions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <span className="text-sm font-medium text-foreground">312 executions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="text-sm font-medium text-foreground">1,234 executions</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <h4 className="font-medium text-foreground mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Execution Time</span>
                    <span className="text-sm font-medium text-foreground">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">96.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="text-sm font-medium text-red-600">3.2%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <h4 className="font-medium text-foreground mb-4">Impact Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Records Processed</span>
                    <span className="text-sm font-medium text-foreground">2.3M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Automation Savings</span>
                    <span className="text-sm font-medium text-green-600">156 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost Reduction</span>
                    <span className="text-sm font-medium text-green-600">$12,400</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Active Rules */}
            <div className="bg-card rounded-lg p-6 border">
              <h4 className="font-medium text-foreground mb-4">Most Active Rules</h4>
              <div className="space-y-3">
                {rules
                  .sort((a, b) => b.executionCount - a.executionCount)
                  .slice(0, 5)
                  .map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{rule.executionCount}</p>
                        <p className="text-sm text-muted-foreground">executions</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Engine Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Rules Engine</h3>
              <p className="text-sm text-muted-foreground">Intelligent automation and decision making</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground">Processing</span>
            </div>
            <button className="btn-primary">
              <Settings className="w-4 h-4 mr-2" />
              Configure AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-foreground">Smart Triggers</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered rule triggering based on patterns and context
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-foreground">Auto-Optimization</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Continuous rule optimization for maximum efficiency
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-foreground">Conflict Detection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Intelligent detection and resolution of rule conflicts
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-foreground">Rule Suggestions</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              ML-generated recommendations for new business rules
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Rules