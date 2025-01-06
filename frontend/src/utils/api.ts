/**
 * Centralized API client with automatic authentication header injection
 */

interface ApiResponse<T = any> {
  data: T
  status: number
  ok: boolean
}

class ApiClient {
  private baseURL: string

  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | null {
    // Get token from localStorage (Zustand persistence)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.token || null
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return null
  }

  private async makeRequest<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    const response = await fetch(`${this.baseURL}${url}`, config)
    
    let data: T
    try {
      data = await response.json()
    } catch (error) {
      // Handle non-JSON responses
      data = await response.text() as any
    }

    return {
      data,
      status: response.status,
      ok: response.ok,
    }
  }

  async get<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = { ...options, method: 'POST' }
    
    if (body !== undefined) {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData, let browser set it with boundary
        const { 'Content-Type': _, ...headersWithoutContentType } = options.headers as any || {}
        config.headers = headersWithoutContentType
        config.body = body
      } else {
        config.body = JSON.stringify(body)
      }
    }

    return this.makeRequest<T>(url, config)
  }

  async put<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = { ...options, method: 'PUT' }
    
    if (body !== undefined) {
      config.body = JSON.stringify(body)
    }

    return this.makeRequest<T>(url, config)
  }

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' })
  }

  async patch<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = { ...options, method: 'PATCH' }
    
    if (body !== undefined) {
      config.body = JSON.stringify(body)
    }

    return this.makeRequest<T>(url, config)
  }
}

// Create singleton instance
export const api = new ApiClient()

// Helper function for quick API calls
export const apiCall = {
  get: api.get.bind(api),
  post: api.post.bind(api),
  put: api.put.bind(api),
  delete: api.delete.bind(api),
  patch: api.patch.bind(api),
}

export default api