import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Zap,
  Mail,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Check,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  MapPin,
  Tag,
  Package,
  BarChart3,
  Activity,
  Target,
  Award,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Cloud,
  Server,
  Lock,
  Unlock,
  UserCheck,
  Crown,
  Gem,
  Star,
  Heart,
  ThumbsUp,
  Flag,
  Bookmark,
  Calendar,
  Search,
  Filter,
  SortAsc,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Copy,
  Share2
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')
  const [isDirty, setIsDirty] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      title: 'Inventory Manager',
      department: 'Operations',
      phone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      language: 'en',
      avatar: ''
    },
    notifications: {
      email: {
        lowStock: true,
        newOrders: true,
        systemUpdates: false,
        weeklyReports: true,
        alerts: true
      },
      push: {
        lowStock: true,
        newOrders: false,
        systemUpdates: false,
        alerts: true
      },
      sms: {
        criticalAlerts: true,
        weeklyReports: false
      }
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipRestriction: false,
      allowedIPs: []
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      apiRateLimit: 1000,
      maxFileSize: 100,
      enableAuditLog: true,
      debugMode: false
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      density: 'comfortable',
      animations: true,
      sidebar: 'expanded',
      language: 'en'
    },
    integrations: {
      erp: {
        enabled: false,
        endpoint: '',
        apiKey: ''
      },
      accounting: {
        enabled: false,
        provider: 'quickbooks',
        credentials: {}
      },
      shipping: {
        enabled: true,
        providers: ['fedex', 'ups'],
        defaultProvider: 'fedex'
      }
    }
  })

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: User
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how you receive alerts and updates',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage security settings and access controls',
      icon: Shield
    },
    {
      id: 'system',
      title: 'System',
      description: 'Configure system-wide settings and preferences',
      icon: Database
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the application',
      icon: Palette
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with external systems and services',
      icon: Globe
    }
  ]

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
    setIsDirty(true)
  }

  const handleNestedSettingChange = (section: string, subSection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subSection]: {
          ...(prev[section as keyof typeof prev] as any)[subSection],
          [key]: value
        }
      }
    }))
    setIsDirty(true)
  }

  const handleSaveSettings = async () => {
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsDirty(false)
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              value={settings.profile.title}
              onChange={(e) => handleSettingChange('profile', 'title', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Department</label>
            <input
              type="text"
              value={settings.profile.department}
              onChange={(e) => handleSettingChange('profile', 'department', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Timezone</label>
            <select
              value={settings.profile.timezone}
              onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
              className="input-field"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="form-label">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Enter new password"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNestedSettingChange('notifications', 'email', key, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNestedSettingChange('notifications', 'push', key, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Receive SMS notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNestedSettingChange('notifications', 'sms', key, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              {settings.security.twoFactorEnabled && (
                <button className="btn-outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Configure
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="input-field"
              min="5"
              max="480"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.security.passwordExpiry}
              onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
              className="input-field"
              min="30"
              max="365"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Access Control</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">IP Restriction</h4>
              <p className="text-sm text-muted-foreground">
                Restrict access to specific IP addresses
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.security.ipRestriction}
                onChange={(e) => handleSettingChange('security', 'ipRestriction', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Backup & Recovery</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Automatic Backup</h4>
              <p className="text-sm text-muted-foreground">
                Automatically backup data at scheduled intervals
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          {settings.system.autoBackup && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">Backup Frequency</label>
                <select
                  value={settings.system.backupFrequency}
                  onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                  className="input-field"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="form-label">Data Retention (days)</label>
                <input
                  type="number"
                  value={settings.system.dataRetention}
                  onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                  className="input-field"
                  min="30"
                  max="2555"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label">API Rate Limit (requests/hour)</label>
            <input
              type="number"
              value={settings.system.apiRateLimit}
              onChange={(e) => handleSettingChange('system', 'apiRateLimit', parseInt(e.target.value))}
              className="input-field"
              min="100"
              max="10000"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">Max File Size (MB)</label>
            <input
              type="number"
              value={settings.system.maxFileSize}
              onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
              className="input-field"
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Logging & Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Audit Logging</h4>
              <p className="text-sm text-muted-foreground">
                Log all user actions and system events
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.system.enableAuditLog}
                onChange={(e) => handleSettingChange('system', 'enableAuditLog', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Debug Mode</h4>
              <p className="text-sm text-muted-foreground">
                Enable detailed logging for troubleshooting
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.system.debugMode}
                onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', preview: 'bg-white border-2' },
            { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-2' },
            { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' }
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleSettingChange('appearance', 'theme', theme.value)}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                settings.appearance.theme === theme.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className={`w-full h-12 rounded mb-2 ${theme.preview}`}></div>
              <p className="font-medium">{theme.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Primary Color</h3>
        <div className="grid grid-cols-6 gap-3">
          {[
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleSettingChange('appearance', 'primaryColor', color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                settings.appearance.primaryColor === color
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            >
              {settings.appearance.primaryColor === color && (
                <Check className="w-6 h-6 text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Layout Density</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' }
          ].map((density) => (
            <button
              key={density.value}
              onClick={() => handleSettingChange('appearance', 'density', density.value)}
              className={`p-4 rounded-lg border text-center transition-colors ${
                settings.appearance.density === density.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <p className="font-medium">{density.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Interface Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Animations</h4>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.appearance.animations}
                onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">ERP Integration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Enable ERP Integration</h4>
              <p className="text-sm text-muted-foreground">
                Connect with your ERP system for data synchronization
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.integrations.erp.enabled}
                onChange={(e) => handleNestedSettingChange('integrations', 'erp', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          {settings.integrations.erp.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">API Endpoint</label>
                <input
                  type="url"
                  value={settings.integrations.erp.endpoint}
                  onChange={(e) => handleNestedSettingChange('integrations', 'erp', 'endpoint', e.target.value)}
                  className="input-field"
                  placeholder="https://api.erp-system.com"
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  value={settings.integrations.erp.apiKey}
                  onChange={(e) => handleNestedSettingChange('integrations', 'erp', 'apiKey', e.target.value)}
                  className="input-field"
                  placeholder="Enter API key"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Accounting Integration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Enable Accounting Integration</h4>
              <p className="text-sm text-muted-foreground">
                Sync financial data with your accounting system
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.integrations.accounting.enabled}
                onChange={(e) => handleNestedSettingChange('integrations', 'accounting', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          {settings.integrations.accounting.enabled && (
            <div className="space-y-2">
              <label className="form-label">Provider</label>
              <select
                value={settings.integrations.accounting.provider}
                onChange={(e) => handleNestedSettingChange('integrations', 'accounting', 'provider', e.target.value)}
                className="input-field"
              >
                <option value="quickbooks">QuickBooks</option>
                <option value="xero">Xero</option>
                <option value="sage">Sage</option>
                <option value="netsuite">NetSuite</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Shipping Integration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Enable Shipping Integration</h4>
              <p className="text-sm text-muted-foreground">
                Connect with shipping providers for rate calculation
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.integrations.shipping.enabled}
                onChange={(e) => handleNestedSettingChange('integrations', 'shipping', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          {settings.integrations.shipping.enabled && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Enabled Providers</label>
                <div className="space-y-2">
                  {['fedex', 'ups', 'usps', 'dhl'].map((provider) => (
                    <label key={provider} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.integrations.shipping.providers.includes(provider)}
                        onChange={(e) => {
                          const providers = e.target.checked
                            ? [...settings.integrations.shipping.providers, provider]
                            : settings.integrations.shipping.providers.filter(p => p !== provider)
                          handleNestedSettingChange('integrations', 'shipping', 'providers', providers)
                        }}
                      />
                      <span className="capitalize">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label">Default Provider</label>
                <select
                  value={settings.integrations.shipping.defaultProvider}
                  onChange={(e) => handleNestedSettingChange('integrations', 'shipping', 'defaultProvider', e.target.value)}
                  className="input-field"
                >
                  {settings.integrations.shipping.providers.map((provider) => (
                    <option key={provider} value={provider} className="capitalize">
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'system':
        return renderSystemSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'integrations':
        return renderIntegrationsSettings()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Settings</h1>
          <p className="section-subtitle">
            Configure your preferences and system settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </button>
          <button className="btn-outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Settings
          </button>
          {isDirty && (
            <button
              onClick={handleSaveSettings}
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs opacity-80">{section.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg border p-6"
          >
            {renderSectionContent()}
          </motion.div>
        </div>
      </div>

      {/* Floating Save Button */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={handleSaveSettings}
            className="btn-primary shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default Settings