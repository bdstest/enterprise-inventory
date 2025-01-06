import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
  permissions: string[]
  lastLogin?: Date
  createdAt: Date
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Use FormData for login as backend expects form data
          const formData = new FormData()
          formData.append('email', email)
          formData.append('password', password)
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Invalid credentials')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            token: data.access_token,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
        })
      },

      checkAuth: () => {
        const { token } = get()
        
        if (!token) {
          set({ user: null })
          return
        }

        // Verify token validity
        fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Token invalid')
          }
          return response.json()
        })
        .then(data => {
          set({ user: data.user })
        })
        .catch(() => {
          set({ user: null, token: null })
        })
      },

      updateProfile: async (data: Partial<User>) => {
        const { token, user } = get()
        
        if (!token || !user) {
          throw new Error('Not authenticated')
        }

        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            throw new Error('Profile update failed')
          }

          const updatedUser = await response.json()
          
          set({
            user: { ...user, ...updatedUser },
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          })
          throw error
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        const { token } = get()
        
        if (!token) {
          throw new Error('Not authenticated')
        }

        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
          })

          if (!response.ok) {
            throw new Error('Password change failed')
          }

          set({ isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password change failed',
          })
          throw error
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)