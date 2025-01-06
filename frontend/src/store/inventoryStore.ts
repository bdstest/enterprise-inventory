import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface InventoryItem {
  id: string
  name: string
  description?: string
  sku: string
  category: string
  quantity: number
  price: number
  cost: number
  location: string
  supplier: string
  minStock: number
  maxStock: number
  reorderPoint: number
  reorderQuantity: number
  unit: string
  barcode?: string
  images: string[]
  tags: string[]
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: Date
  updatedAt: Date
  lastStockUpdate: Date
}

export interface StockMovement {
  id: string
  itemId: string
  type: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  reason: string
  reference?: string
  location: string
  user: string
  timestamp: Date
  notes?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  children: Category[]
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  name: string
  description?: string
  type: 'warehouse' | 'store' | 'zone' | 'bin'
  parentId?: string
  children: Location[]
  capacity?: number
  currentLoad?: number
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

interface InventoryState {
  // Data
  items: InventoryItem[]
  movements: StockMovement[]
  categories: Category[]
  locations: Location[]
  suppliers: Supplier[]
  
  // UI State
  isLoading: boolean
  error: string | null
  selectedItem: InventoryItem | null
  filters: {
    category?: string
    location?: string
    supplier?: string
    status?: string
    search?: string
    lowStock?: boolean
    overStock?: boolean
  }
  sortBy: {
    field: keyof InventoryItem
    direction: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  
  // Actions
  fetchItems: (params?: any) => Promise<void>
  fetchItem: (id: string) => Promise<void>
  createItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  
  // Stock Management
  adjustStock: (itemId: string, quantity: number, reason: string, notes?: string) => Promise<void>
  transferStock: (itemId: string, fromLocation: string, toLocation: string, quantity: number, reason: string) => Promise<void>
  recordStockIn: (itemId: string, quantity: number, reason: string, reference?: string) => Promise<void>
  recordStockOut: (itemId: string, quantity: number, reason: string, reference?: string) => Promise<void>
  
  // Bulk Operations
  bulkUpdate: (ids: string[], updates: Partial<InventoryItem>) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
  importItems: (file: File) => Promise<void>
  exportItems: (format: string, filters?: any) => Promise<void>
  
  // Categories
  fetchCategories: () => Promise<void>
  createCategory: (category: Omit<Category, 'id' | 'children' | 'itemCount' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Locations
  fetchLocations: () => Promise<void>
  createLocation: (location: Omit<Location, 'id' | 'children' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>
  deleteLocation: (id: string) => Promise<void>
  
  // Suppliers
  fetchSuppliers: () => Promise<void>
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
  
  // Movements
  fetchMovements: (itemId?: string) => Promise<void>
  
  // UI Actions
  setSelectedItem: (item: InventoryItem | null) => void
  setFilters: (filters: Partial<InventoryFilters>) => void
  setSortBy: (field: keyof InventoryItem, direction: 'asc' | 'desc') => void
  setPagination: (page: number, limit?: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useInventoryStore = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    items: [],
    movements: [],
    categories: [],
    locations: [],
    suppliers: [],
    
    isLoading: false,
    error: null,
    selectedItem: null,
    filters: {},
    sortBy: { field: 'name', direction: 'asc' },
    pagination: { page: 1, limit: 50, total: 0 },
    
    // Fetch items with filtering and pagination
    fetchItems: async (params = {}) => {
      set({ isLoading: true, error: null })
      
      try {
        const { filters, sortBy, pagination } = get()
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sort_by: sortBy.field,
          sort_order: sortBy.direction,
          ...filters,
          ...params,
        })
        
        const response = await fetch(`/api/inventory/items?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        
        const data = await response.json()
        
        set({
          items: data.items,
          pagination: { ...pagination, total: data.total },
          isLoading: false,
        })
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch items',
        })
      }
    },
    
    fetchItem: async (id: string) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch item')
        }
        
        const item = await response.json()
        
        set({
          selectedItem: item,
          isLoading: false,
        })
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch item',
        })
      }
    },
    
    createItem: async (itemData) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to create item')
        }
        
        const newItem = await response.json()
        
        set(state => ({
          items: [...state.items, newItem],
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create item',
        })
        throw error
      }
    },
    
    updateItem: async (id, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update item')
        }
        
        const updatedItem = await response.json()
        
        set(state => ({
          items: state.items.map(item => 
            item.id === id ? updatedItem : item
          ),
          selectedItem: state.selectedItem?.id === id ? updatedItem : state.selectedItem,
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update item',
        })
        throw error
      }
    },
    
    deleteItem: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete item')
        }
        
        set(state => ({
          items: state.items.filter(item => item.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete item',
        })
        throw error
      }
    },
    
    // Stock Management
    adjustStock: async (itemId, quantity, reason, notes) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${itemId}/adjust-stock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity, reason, notes }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to adjust stock')
        }
        
        const result = await response.json()
        
        // Update the item in the store
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity: result.new_quantity } : item
          ),
          isLoading: false,
        }))
        
        // Refresh movements
        get().fetchMovements(itemId)
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to adjust stock',
        })
        throw error
      }
    },
    
    transferStock: async (itemId, fromLocation, toLocation, quantity, reason) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${itemId}/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from_location: fromLocation, to_location: toLocation, quantity, reason }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to transfer stock')
        }
        
        set({ isLoading: false })
        
        // Refresh data
        get().fetchItems()
        get().fetchMovements(itemId)
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to transfer stock',
        })
        throw error
      }
    },
    
    recordStockIn: async (itemId, quantity, reason, reference) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${itemId}/stock-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity, reason, reference }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to record stock in')
        }
        
        const result = await response.json()
        
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity: result.new_quantity } : item
          ),
          isLoading: false,
        }))
        
        get().fetchMovements(itemId)
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to record stock in',
        })
        throw error
      }
    },
    
    recordStockOut: async (itemId, quantity, reason, reference) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/items/${itemId}/stock-out`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity, reason, reference }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to record stock out')
        }
        
        const result = await response.json()
        
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity: result.new_quantity } : item
          ),
          isLoading: false,
        }))
        
        get().fetchMovements(itemId)
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to record stock out',
        })
        throw error
      }
    },
    
    // Bulk Operations
    bulkUpdate: async (ids, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/items/bulk-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids, updates }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to bulk update items')
        }
        
        set({ isLoading: false })
        
        // Refresh items
        get().fetchItems()
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to bulk update items',
        })
        throw error
      }
    },
    
    bulkDelete: async (ids) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/items/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to bulk delete items')
        }
        
        set(state => ({
          items: state.items.filter(item => !ids.includes(item.id)),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to bulk delete items',
        })
        throw error
      }
    },
    
    importItems: async (file) => {
      set({ isLoading: true, error: null })
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/inventory/import', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to import items')
        }
        
        set({ isLoading: false })
        
        // Refresh items
        get().fetchItems()
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to import items',
        })
        throw error
      }
    },
    
    exportItems: async (format, filters) => {
      set({ isLoading: true, error: null })
      
      try {
        const queryParams = new URLSearchParams({
          format,
          ...filters,
        })
        
        const response = await fetch(`/api/inventory/export?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to export items')
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
        
        set({ isLoading: false })
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to export items',
        })
        throw error
      }
    },
    
    // Categories
    fetchCategories: async () => {
      try {
        const response = await fetch('/api/inventory/categories')
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const categories = await response.json()
        
        set({ categories })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch categories',
        })
      }
    },
    
    createCategory: async (categoryData) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to create category')
        }
        
        const newCategory = await response.json()
        
        set(state => ({
          categories: [...state.categories, newCategory],
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create category',
        })
        throw error
      }
    },
    
    updateCategory: async (id, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/categories/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update category')
        }
        
        const updatedCategory = await response.json()
        
        set(state => ({
          categories: state.categories.map(cat =>
            cat.id === id ? updatedCategory : cat
          ),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update category',
        })
        throw error
      }
    },
    
    deleteCategory: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/categories/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete category')
        }
        
        set(state => ({
          categories: state.categories.filter(cat => cat.id !== id),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete category',
        })
        throw error
      }
    },
    
    // Locations
    fetchLocations: async () => {
      try {
        const response = await fetch('/api/inventory/locations')
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }
        
        const locations = await response.json()
        
        set({ locations })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch locations',
        })
      }
    },
    
    createLocation: async (locationData) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to create location')
        }
        
        const newLocation = await response.json()
        
        set(state => ({
          locations: [...state.locations, newLocation],
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create location',
        })
        throw error
      }
    },
    
    updateLocation: async (id, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/locations/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update location')
        }
        
        const updatedLocation = await response.json()
        
        set(state => ({
          locations: state.locations.map(loc =>
            loc.id === id ? updatedLocation : loc
          ),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update location',
        })
        throw error
      }
    },
    
    deleteLocation: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/locations/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete location')
        }
        
        set(state => ({
          locations: state.locations.filter(loc => loc.id !== id),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete location',
        })
        throw error
      }
    },
    
    // Suppliers
    fetchSuppliers: async () => {
      try {
        const response = await fetch('/api/inventory/suppliers')
        
        if (!response.ok) {
          throw new Error('Failed to fetch suppliers')
        }
        
        const suppliers = await response.json()
        
        set({ suppliers })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
        })
      }
    },
    
    createSupplier: async (supplierData) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch('/api/inventory/suppliers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supplierData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to create supplier')
        }
        
        const newSupplier = await response.json()
        
        set(state => ({
          suppliers: [...state.suppliers, newSupplier],
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create supplier',
        })
        throw error
      }
    },
    
    updateSupplier: async (id, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/suppliers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update supplier')
        }
        
        const updatedSupplier = await response.json()
        
        set(state => ({
          suppliers: state.suppliers.map(sup =>
            sup.id === id ? updatedSupplier : sup
          ),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update supplier',
        })
        throw error
      }
    },
    
    deleteSupplier: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await fetch(`/api/inventory/suppliers/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete supplier')
        }
        
        set(state => ({
          suppliers: state.suppliers.filter(sup => sup.id !== id),
          isLoading: false,
        }))
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete supplier',
        })
        throw error
      }
    },
    
    // Movements
    fetchMovements: async (itemId) => {
      try {
        const url = itemId ? `/api/inventory/movements/${itemId}` : '/api/inventory/movements'
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch movements')
        }
        
        const movements = await response.json()
        
        set({ movements })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch movements',
        })
      }
    },
    
    // UI Actions
    setSelectedItem: (item) => set({ selectedItem: item }),
    setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),
    setSortBy: (field, direction) => set({ sortBy: { field, direction } }),
    setPagination: (page, limit) => set(state => ({ 
      pagination: { ...state.pagination, page, ...(limit && { limit }) } 
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }))
)