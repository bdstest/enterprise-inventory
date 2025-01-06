import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  Download,
  FileText,
  Database,
  Settings,
  Play,
  Pause,
  Square,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileJson,
  FileImage,
  File,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Info,
  HelpCircle,
  Zap,
  Shield,
  Globe,
  Cloud,
  Server,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  Calendar,
  MapPin,
  Building,
  Package,
  Tag,
  Hash,
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Flag,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Camera,
  Mic,
  Speaker,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryLow,
  Signal,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Radio,
  Headphones,
  Gamepad2,
  Joystick,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Fax,
  Phone as PhoneIcon,
  Voicemail,
  Rss,
  Podcast,
  Music,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume,
  VolumeDown,
  VolumeUp,
  Mute,
  Unmute
} from 'lucide-react'

interface ETLJob {
  id: string
  name: string
  type: 'import' | 'export' | 'transformation' | 'validation'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  source: string
  destination: string
  format: string
  progress: number
  recordsProcessed: number
  totalRecords: number
  startTime?: Date
  endTime?: Date
  duration?: number
  errors: string[]
  warnings: string[]
  createdBy: string
  createdAt: Date
}

interface DataMapping {
  sourceColumn: string
  targetColumn: string
  dataType: string
  transformation?: string
  validation?: string
  required: boolean
}

interface ETLTemplate {
  id: string
  name: string
  description: string
  sourceFormat: string
  targetFormat: string
  mappings: DataMapping[]
  validationRules: string[]
  transformationRules: string[]
  isDefault: boolean
  createdAt: Date
  usageCount: number
}

const ETL: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'jobs' | 'templates' | 'logs'>('import')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [mappingMode, setMappingMode] = useState<'auto' | 'manual'>('auto')
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useState<ETLJob[]>([])
  const [templates, setTemplates] = useState<ETLTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ETLTemplate | null>(null)
  const [showMappingEditor, setShowMappingEditor] = useState(false)
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [validationResults, setValidationResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedFormats = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel files (.xlsx, .xls)' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
    { value: 'xml', label: 'XML', icon: FileText, description: 'Extensible Markup Language' },
    { value: 'yaml', label: 'YAML', icon: FileText, description: 'YAML Ain\'t Markup Language' },
    { value: 'tsv', label: 'TSV', icon: FileText, description: 'Tab-separated values' },
    { value: 'parquet', label: 'Parquet', icon: Database, description: 'Apache Parquet columnar storage' },
    { value: 'jsonl', label: 'JSONL', icon: FileJson, description: 'JSON Lines format' },
    { value: 'pdf', label: 'PDF', icon: FileImage, description: 'Portable Document Format (tables only)' }
  ]

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { value: 'json', label: 'JSON', icon: FileJson },
    { value: 'xml', label: 'XML', icon: FileText },
    { value: 'yaml', label: 'YAML', icon: FileText },
    { value: 'pdf', label: 'PDF Report', icon: FileImage },
    { value: 'parquet', label: 'Parquet', icon: Database }
  ]

  // Sample data
  const sampleJobs: ETLJob[] = [
    {
      id: '1',
      name: 'Product Catalog Import',
      type: 'import',
      status: 'completed',
      source: 'supplier_catalog.xlsx',
      destination: 'products',
      format: 'excel',
      progress: 100,
      recordsProcessed: 1234,
      totalRecords: 1234,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
      duration: 15,
      errors: [],
      warnings: ['2 duplicate SKUs found and merged'],
      createdBy: 'John Doe',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Inventory Export',
      type: 'export',
      status: 'running',
      source: 'inventory',
      destination: 'inventory_report.pdf',
      format: 'pdf',
      progress: 65,
      recordsProcessed: 1523,
      totalRecords: 2345,
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      errors: [],
      warnings: [],
      createdBy: 'Jane Smith',
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Stock Level Sync',
      type: 'transformation',
      status: 'failed',
      source: 'external_api',
      destination: 'stock_levels',
      format: 'json',
      progress: 23,
      recordsProcessed: 234,
      totalRecords: 1000,
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 25 * 60 * 1000),
      duration: 5,
      errors: ['API authentication failed', 'Connection timeout'],
      warnings: [],
      createdBy: 'System',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]

  const sampleTemplates: ETLTemplate[] = [
    {
      id: '1',
      name: 'Standard Product Import',
      description: 'Template for importing product catalogs from suppliers',
      sourceFormat: 'excel',
      targetFormat: 'database',
      mappings: [
        { sourceColumn: 'Product Name', targetColumn: 'name', dataType: 'string', required: true },
        { sourceColumn: 'SKU', targetColumn: 'sku', dataType: 'string', required: true },
        { sourceColumn: 'Price', targetColumn: 'price', dataType: 'decimal', required: true },
        { sourceColumn: 'Category', targetColumn: 'category', dataType: 'string', required: false }
      ],
      validationRules: ['SKU must be unique', 'Price must be positive'],
      transformationRules: ['Trim whitespace', 'Convert currency to decimal'],
      isDefault: true,
      createdAt: new Date('2024-01-01'),
      usageCount: 45
    },
    {
      id: '2',
      name: 'Inventory Stock Update',
      description: 'Template for updating stock levels from warehouse systems',
      sourceFormat: 'csv',
      targetFormat: 'database',
      mappings: [
        { sourceColumn: 'Item Code', targetColumn: 'sku', dataType: 'string', required: true },
        { sourceColumn: 'Quantity', targetColumn: 'quantity', dataType: 'integer', required: true },
        { sourceColumn: 'Location', targetColumn: 'location', dataType: 'string', required: true }
      ],
      validationRules: ['Quantity must be non-negative', 'Item Code must exist'],
      transformationRules: ['Normalize location codes'],
      isDefault: false,
      createdAt: new Date('2024-01-15'),
      usageCount: 23
    }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles)
    
    // Auto-detect format based on file extension
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension) {
        const formatMap: { [key: string]: string } = {
          'csv': 'csv',
          'xlsx': 'excel',
          'xls': 'excel',
          'json': 'json',
          'xml': 'xml',
          'yaml': 'yaml',
          'yml': 'yaml',
          'tsv': 'tsv',
          'parquet': 'parquet',
          'jsonl': 'jsonl',
          'pdf': 'pdf'
        }
        if (formatMap[extension]) {
          setSelectedFormat(formatMap[extension])
        }
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/xml': ['.xml'],
      'text/yaml': ['.yaml', '.yml'],
      'text/tab-separated-values': ['.tsv'],
      'application/octet-stream': ['.parquet'],
      'application/x-ndjson': ['.jsonl'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const handleStartImport = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('format', selectedFormat)
      formData.append('mapping_mode', mappingMode)
      
      if (selectedTemplate) {
        formData.append('template_id', selectedTemplate.id)
      }

      const response = await fetch('/api/etl/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      
      // Add new job to the list
      const newJob: ETLJob = {
        id: result.job_id,
        name: `Import ${selectedFiles[0].name}`,
        type: 'import',
        status: 'running',
        source: selectedFiles[0].name,
        destination: 'inventory',
        format: selectedFormat,
        progress: 0,
        recordsProcessed: 0,
        totalRecords: result.total_records || 0,
        startTime: new Date(),
        errors: [],
        warnings: [],
        createdBy: 'Current User',
        createdAt: new Date()
      }
      
      setJobs(prev => [newJob, ...prev])
      setActiveTab('jobs')
      
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async (format: string, filters: any = {}) => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...filters
      })

      const response = await fetch(`/api/etl/export?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getStatusIcon = (status: ETLJob['status']) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'running': return Activity
      case 'failed': return XCircle
      case 'paused': return Pause
      case 'pending': return Clock
      default: return Clock
    }
  }

  const getStatusColor = (status: ETLJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'running': return 'text-blue-600'
      case 'failed': return 'text-red-600'
      case 'paused': return 'text-yellow-600'
      case 'pending': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">ETL Manager</h1>
          <p className="section-subtitle">
            Extract, Transform, Load data across multiple formats with AI-powered processing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </button>
          <button className="btn-outline">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">1,234</div>
              <div className="metric-label">Records Imported</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">567</div>
              <div className="metric-label">Records Exported</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">3</div>
              <div className="metric-label">Active Jobs</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="metric-value">98.5%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-list">
        {['import', 'export', 'jobs', 'templates', 'logs'].map((tab) => (
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
        {/* Import Tab */}
        {activeTab === 'import' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Import Data</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Supported formats:</span>
                <div className="flex items-center space-x-1">
                  {supportedFormats.slice(0, 5).map((format) => (
                    <span key={format.value} className="text-xs bg-muted px-2 py-1 rounded">
                      {format.label}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">+4 more</span>
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports: CSV, Excel, JSON, XML, YAML, TSV, Parquet, JSONL, PDF
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Selected Files</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="form-label">Data Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="input-field"
                >
                  {supportedFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label} - {format.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="form-label">Mapping Mode</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="auto"
                      checked={mappingMode === 'auto'}
                      onChange={(e) => setMappingMode(e.target.value as any)}
                      className="form-radio"
                    />
                    <span>Auto-detect</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="manual"
                      checked={mappingMode === 'manual'}
                      onChange={(e) => setMappingMode(e.target.value as any)}
                      className="form-radio"
                    />
                    <span>Manual mapping</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="form-label">Import Template (Optional)</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = sampleTemplates.find(t => t.id === e.target.value)
                  setSelectedTemplate(template || null)
                }}
                className="input-field"
              >
                <option value="">Select a template...</option>
                {sampleTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.sourceFormat} → {template.targetFormat})
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowMappingEditor(true)}
                  className="btn-outline"
                  disabled={selectedFiles.length === 0}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Mapping
                </button>
                <button className="btn-outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Data
                </button>
              </div>
              <button
                onClick={handleStartImport}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="btn-primary"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Import
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
              <button className="btn-outline">
                <Settings className="w-4 h-4 mr-2" />
                Export Settings
              </button>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportFormats.map((format) => (
                <motion.div
                  key={format.value}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleExport(format.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <format.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{format.label}</h4>
                      <p className="text-sm text-muted-foreground">Export as {format.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Export Filters */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-foreground">Export Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="form-label">Category</label>
                  <select className="input-field">
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="form-label">Location</label>
                  <select className="input-field">
                    <option value="">All Locations</option>
                    <option value="warehouse-a">Warehouse A</option>
                    <option value="warehouse-b">Warehouse B</option>
                    <option value="store-1">Store 1</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="form-label">Date Range</label>
                  <select className="input-field">
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduled Exports */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Scheduled Exports</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">Daily Inventory Report</p>
                      <p className="text-sm text-muted-foreground">Excel export at 6:00 AM daily</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="status-badge success">Active</span>
                    <button className="btn-outline">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-foreground">Weekly Analytics</p>
                      <p className="text-sm text-muted-foreground">PDF report every Monday</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="status-badge warning">Paused</span>
                    <button className="btn-outline">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button className="btn-outline">
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Export
              </button>
            </div>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">ETL Jobs</h3>
              <div className="flex items-center space-x-3">
                <button className="btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
                <button className="btn-outline">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {sampleJobs.map((job) => {
                const StatusIcon = getStatusIcon(job.status)
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(job.status)}`} />
                        <div>
                          <h4 className="font-medium text-foreground">{job.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)} • {job.format.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${job.status}`}>{job.status}</span>
                        <button className="btn-outline">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn-outline">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {job.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm text-foreground">{job.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Source</p>
                        <p className="text-foreground font-medium">{job.source}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Destination</p>
                        <p className="text-foreground font-medium">{job.destination}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="text-foreground font-medium">
                          {job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="text-foreground font-medium">
                          {job.duration ? formatDuration(job.duration) : 'In progress'}
                        </p>
                      </div>
                    </div>

                    {/* Errors and Warnings */}
                    {(job.errors.length > 0 || job.warnings.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {job.errors.map((error, index) => (
                          <div key={index} className="alert error">
                            <XCircle className="w-4 h-4" />
                            <span>{error}</span>
                          </div>
                        ))}
                        {job.warnings.map((warning, index) => (
                          <div key={index} className="alert warning">
                            <AlertCircle className="w-4 h-4" />
                            <span>{warning}</span>
                          </div>
                        ))}
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
              <h3 className="text-lg font-semibold text-foreground">ETL Templates</h3>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{template.name}</h4>
                      {template.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="btn-outline">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="btn-outline">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>

                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="text-foreground font-medium">{template.sourceFormat}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="text-foreground font-medium">{template.targetFormat}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {template.mappings.length} mappings, {template.validationRules.length} rules
                    </span>
                    <span className="text-muted-foreground">
                      Used {template.usageCount} times
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">ETL Logs</h3>
              <div className="flex items-center space-x-3">
                <button className="btn-outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </button>
                <button className="btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Log Filters */}
            <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
              <select className="input-field">
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <select className="input-field">
                <option value="">All Jobs</option>
                <option value="import">Import Jobs</option>
                <option value="export">Export Jobs</option>
                <option value="transformation">Transformations</option>
              </select>
              <input
                type="text"
                placeholder="Search logs..."
                className="input-field"
              />
            </div>

            {/* Logs List */}
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg space-y-1 max-h-96 overflow-y-auto">
              <div>[2024-01-07 14:23:15] INFO: Starting import job 'Product Catalog Import'</div>
              <div>[2024-01-07 14:23:16] INFO: Processing file 'supplier_catalog.xlsx'</div>
              <div>[2024-01-07 14:23:17] INFO: Auto-detected 4 columns in source data</div>
              <div>[2024-01-07 14:23:18] INFO: Applied mapping template 'Standard Product Import'</div>
              <div>[2024-01-07 14:23:20] WARNING: Duplicate SKU found: 'PROD-001', merging records</div>
              <div>[2024-01-07 14:23:22] INFO: Validated 1,234 records successfully</div>
              <div>[2024-01-07 14:23:25] INFO: Inserted 1,232 new products</div>
              <div>[2024-01-07 14:23:26] INFO: Updated 2 existing products</div>
              <div>[2024-01-07 14:23:27] INFO: Import job completed successfully</div>
              <div>[2024-01-07 14:25:10] INFO: Starting export job 'Inventory Report'</div>
              <div>[2024-01-07 14:25:11] INFO: Exporting 2,345 items to PDF format</div>
              <div>[2024-01-07 14:25:15] INFO: Generated report with 45 pages</div>
              <div>[2024-01-07 14:25:16] INFO: Export job completed successfully</div>
              <div>[2024-01-07 14:30:05] ERROR: Failed to connect to external API</div>
              <div>[2024-01-07 14:30:06] ERROR: Job 'Stock Level Sync' terminated with errors</div>
              <div>[2024-01-07 14:35:12] INFO: Scheduled job 'Daily Backup' started</div>
              <div>[2024-01-07 14:35:45] INFO: Backup completed, 2.3GB archived</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI-Powered Features Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI-Powered ETL</h3>
              <p className="text-sm text-muted-foreground">Smart data processing and optimization</p>
            </div>
          </div>
          <button className="btn-primary">
            <Settings className="w-4 h-4 mr-2" />
            Configure AI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-foreground">Smart Mapping</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              AI automatically detects and maps data columns with 95% accuracy
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-foreground">Data Validation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Intelligent validation rules prevent data quality issues
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-foreground">Performance Optimization</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              ML-optimized processing for maximum throughput and efficiency
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ETL