import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInventoryStore } from '../store/inventoryStore'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  Grid,
  List,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Building,
  Tag,
  DollarSign,
  Hash,
  Calendar,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Settings,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

const Inventory: React.FC = () => {
  const {
    items,
    categories,
    locations,
    suppliers,
    isLoading,
    error,
    filters,
    sortBy,
    pagination,
    selectedItem,
    fetchItems,
    setFilters,
    setSortBy,
    setPagination,
    setSelectedItem
  } = useInventoryStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    fetchItems()
  }, [fetchItems, filters, sortBy, pagination.page])

  const getStockStatus = (item: any) => {
    if (item.quantity <= 0) return { status: 'out_of_stock', color: 'text-red-600', label: 'Out of Stock' }
    if (item.quantity <= item.reorderPoint) return { status: 'low_stock', color: 'text-orange-600', label: 'Low Stock' }
    if (item.quantity >= item.maxStock) return { status: 'overstock', color: 'text-purple-600', label: 'Overstock' }
    return { status: 'in_stock', color: 'text-green-600', label: 'In Stock' }
  }

  const handleSort = (field: string) => {
    const direction = sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc'
    setSortBy(field as any, direction)
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.id))
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p className="text-foreground font-medium">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Inventory Management</h1>
          <p className="section-subtitle">
            Comprehensive inventory tracking with real-time updates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn-outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <div className="metric-value">{items.length}</div>
              <div className="metric-label">Total Items</div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <div className="metric-value">
                {items.filter(item => item.quantity <= item.reorderPoint).length}
              </div>
              <div className="metric-label">Low Stock</div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <div className="metric-value">
                ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
              </div>
              <div className="metric-label">Total Value</div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-purple-600" />
            <div>
              <div className="metric-value">{locations.length}</div>
              <div className="metric-label">Locations</div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <Tag className="w-8 h-8 text-cyan-600" />
            <div>
              <div className="metric-value">{categories.length}</div>
              <div className="metric-label">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 pr-4 py-2 w-80 input-field"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button className="btn-outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length > 0 && `${selectedItems.length} selected`}
            </span>
            {selectedItems.length > 0 && (
              <>
                <button className="btn-outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Bulk Edit
                </button>
                <button className="btn-outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </button>
              </>
            )}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Location</label>
                <select
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ location: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Supplier</label>
                <select
                  value={filters.supplier || ''}
                  onChange={(e) => setFilters({ supplier: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ status: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.lowStock || false}
                  onChange={(e) => setFilters({ lowStock: e.target.checked })}
                />
                <span className="text-sm">Low Stock Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.overStock || false}
                  onChange={(e) => setFilters({ overStock: e.target.checked })}
                />
                <span className="text-sm">Overstock Only</span>
              </label>
              <button
                onClick={() => setFilters({})}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Inventory Table/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Name</span>
                      {sortBy.field === 'name' && (
                        sortBy.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>
                    <button
                      onClick={() => handleSort('quantity')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Quantity</span>
                      {sortBy.field === 'quantity' && (
                        sortBy.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Price</span>
                      {sortBy.field === 'price' && (
                        sortBy.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stockStatus = getStockStatus(item)
                  return (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center space-x-3">
                          {item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-48">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{item.sku}</span>
                      </td>
                      <td>
                        <span className="status-badge info">{item.category}</span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${stockStatus.color}`}>
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground">{item.unit}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{item.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${stockStatus.status}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const stockStatus = getStockStatus(item)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded"
                  />
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center mb-3">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{item.sku}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                    <span className={`status-badge ${stockStatus.status}`}>
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`font-medium ${stockStatus.color}`}>
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{item.location}</span>
                  </div>

                  <div className="flex items-center space-x-1 pt-2 border-t">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="btn-outline flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="btn-outline">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} items
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPagination(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-outline"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPagination(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            className="btn-outline"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedItem.images.length > 0 ? (
                  <img
                    src={selectedItem.images[0]}
                    alt={selectedItem.name}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description || 'No description available'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">SKU</label>
                    <p className="font-mono">{selectedItem.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <p>{selectedItem.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Quantity</label>
                    <p>{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Price</label>
                    <p>${selectedItem.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Cost</label>
                    <p>${selectedItem.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <p>{selectedItem.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Supplier</label>
                    <p>{selectedItem.supplier}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <span className={`status-badge ${selectedItem.status}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Stock Levels</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Min:</span>
                      <span className="ml-1">{selectedItem.minStock}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reorder:</span>
                      <span className="ml-1">{selectedItem.reorderPoint}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max:</span>
                      <span className="ml-1">{selectedItem.maxStock}</span>
                    </div>
                  </div>
                </div>

                {selectedItem.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.tags.map((tag) => (
                        <span key={tag} className="status-badge info">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <button className="btn-primary flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Item
                  </button>
                  <button className="btn-outline">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="btn-outline">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Inventory