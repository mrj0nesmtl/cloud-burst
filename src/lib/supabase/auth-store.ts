import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { AuthState, Capability, UserRole, AuthError } from '@/types/auth'
import { roleCapabilities } from '@/types/auth'
import { createClient, handleError } from './client'
import { getAuthenticatedUser } from '@/lib/supabase/auth-utils'

interface AuthStore extends AuthState {
  // Enhanced state
  error: AuthError | null
  isAuthenticated: boolean
  lastActivity: string | null
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<AuthState['user']>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  
  // State management
  setUser: (user: AuthState['user']) => void
  setSession: (session: AuthState['session']) => void
  setLoading: (loading: boolean) => void
  setError: (error: AuthError | null) => void
  setCapabilities: (capabilities: Capability[]) => void
  clearError: () => void
  
  // Permission checks
  hasCapability: (capability: Capability | Capability[]) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  
  // Session management
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>
  validateSession: () => Promise<boolean>
  
  // Profile management
  updateProfile: (data: Partial<AuthState['user']>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Enhanced initial state
      user: null,
      session: null,
      loading: true,
      error: null,
      capabilities: [],
      isAuthenticated: false,
      lastActivity: null,

      // Improved state setters
      setUser: (user) => set({ 
        user,
        isAuthenticated: !!user,
        lastActivity: new Date().toISOString()
      }),
      
      setSession: (session) => set({ 
        session,
        isAuthenticated: !!session,
        lastActivity: new Date().toISOString()
      }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setCapabilities: (capabilities) => set({ capabilities }),

      // Enhanced permission checks
      hasCapability: (capability) => {
        const { capabilities } = get()
        if (Array.isArray(capability)) {
          return capability.some(cap => 
            capabilities.includes(cap) || capabilities.includes('manage:all')
          )
        }
        return capabilities.includes(capability) || capabilities.includes('manage:all')
      },

      hasRole: (role) => {
        const userRole = get().user?.role
        if (Array.isArray(role)) {
          return role.includes(userRole!)
        }
        return userRole === role
      },

      // Improved sign in with error handling
      signIn: async (email, password) => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true, error: null })
          
          // Use direct call instead of handleError
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
          })
          
          if (error) throw error
          
          // Fetch user profile
          const profileResult = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
            
          if (profileResult.error) {
            console.error('Error fetching profile:', profileResult.error)
            throw profileResult.error
          }
          
          let capabilities: Capability[] = []
          
          try {
            // Try to fetch role capabilities from the database
            const rolePermsResult = await supabase
              .from('role_capabilities')
              .select('capability')
              .eq('role', profileResult.data.role)
              
            if (!rolePermsResult.error && rolePermsResult.data) {
              capabilities = rolePermsResult.data.map(p => p.capability as Capability)
            }
          } catch (capError) {
            console.warn('Error fetching role capabilities, using defaults:', capError)
            // Fallback to hardcoded capabilities if API call fails
            const userRole = profileResult.data.role.toLowerCase() as Lowercase<UserRole>
            capabilities = (roleCapabilities[userRole] || []) as Capability[]
          }

          set({ 
            user: profileResult.data,
            session: data.session,
            capabilities,
            isAuthenticated: true,
            lastActivity: new Date().toISOString(),
            error: null
          })
        } catch (error) {
          console.error('Sign in error:', error)
          set({ 
            error: { 
              message: error instanceof Error ? error.message : 'Failed to sign in',
              code: error instanceof Error ? (error as any).code : undefined
            } 
          })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // New profile management methods
      updateProfile: async (data) => {
        const supabase = createClientComponentClient()
        const { user } = get()
        
        try {
          set({ loading: true, error: null })
          const { error, data: updatedProfile } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user?.id)
            .select()
            .single()

          if (error) throw error

          set({ 
            user: { ...user!, ...updatedProfile },
            lastActivity: new Date().toISOString()
          })
        } catch (error) {
          set({ error: error as AuthError })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      uploadAvatar: async (file) => {
        const supabase = createClientComponentClient()
        const { user } = get()
        
        try {
          set({ loading: true, error: null })
          const fileExt = file.name.split('.').pop()
          const filePath = `avatars/${user?.id}/${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath)

          await get().updateProfile({ avatar_url: publicUrl })

          return publicUrl
        } catch (error) {
          set({ error: error as AuthError })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // Enhanced session validation
      validateSession: async () => {
        const { session, lastActivity } = get()
        if (!session || !lastActivity) return false

        const inactiveTime = Date.now() - new Date(lastActivity).getTime()
        const maxInactiveTime = 24 * 60 * 60 * 1000 // 24 hours

        if (inactiveTime > maxInactiveTime) {
          await get().signOut()
          return false
        }

        set({ lastActivity: new Date().toISOString() })
        return true
      },

      signUp: async (email, password) => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'user' // Default role for new signups
              }
            }
          })
          if (error) throw error
          
          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                role: 'user',
                username: null,
                full_name: null,
                avatar_url: null,
                updated_at: new Date().toISOString()
              },
              session: data.session,
              capabilities: roleCapabilities.user as Capability[]
            })
          }
        } catch (error) {
          console.error('Sign up error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ 
            user: null,
            session: null,
            capabilities: [],
            isAuthenticated: false
          })
          
          // Remove the redirect - we'll handle this in the component
        } catch (error) {
          console.error('Sign out error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email) => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { error } = await supabase.auth.resetPasswordForEmail(email)
          if (error) throw error
        } catch (error) {
          console.error('Reset password error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updatePassword: async (newPassword) => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          })
          if (error) throw error
        } catch (error) {
          console.error('Update password error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      initialize: async () => {
        try {
          set({ loading: true })
          // Use secure authentication method
          const { user, error } = await getAuthenticatedUser()
          
          if (error) throw error
          
          if (user) {
            // Fetch user profile
            const supabase = createClientComponentClient()
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            // Get session for token information
            const { data: { session } } = await supabase.auth.getSession()

            // Try to fetch role capabilities
            try {
              const { data: rolePerms } = await supabase
                .from('role_capabilities')
                .select('capability')
                .eq('role', profile?.role)

              set({ 
                user: profile,
                session: session,
                capabilities: rolePerms?.map(p => p.capability as Capability) ?? [],
                isAuthenticated: true
              })
            } catch (error) {
              console.warn('Error fetching capabilities, using fallback')
              // Use hardcoded capabilities as fallback
              const fallbackCapabilities = profile?.role ? 
                (roleCapabilities[profile.role as keyof typeof roleCapabilities] || []) : []
              
              set({ 
                user: profile,
                session: session,
                capabilities: fallbackCapabilities as Capability[],
                isAuthenticated: true
              })
            }
          }
        } catch (error) {
          console.error('Initialize error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      refreshSession: async () => {
        try {
          set({ loading: true })
          // Use secure authentication method
          const { user, error } = await getAuthenticatedUser()
          
          if (error) throw error
          
          if (user) {
            // Fetch user profile
            const supabase = createClientComponentClient()
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            // Get session for token information
            const { data: { session } } = await supabase.auth.getSession()

            // Try to fetch role capabilities
            try {
              const { data: rolePerms } = await supabase
                .from('role_capabilities')
                .select('capability')
                .eq('role', profile?.role)

              set({ 
                user: profile,
                session: session,
                capabilities: rolePerms?.map(p => p.capability as Capability) ?? [],
                isAuthenticated: true
              })
            } catch (error) {
              console.warn('Error fetching capabilities, using fallback')
              // Use hardcoded capabilities as fallback
              const fallbackCapabilities = profile?.role ? 
                (roleCapabilities[profile.role as keyof typeof roleCapabilities] || []) : []
              
              set({ 
                user: profile,
                session: session,
                capabilities: fallbackCapabilities as Capability[],
                isAuthenticated: true
              })
            }
          } else {
            set({ 
              user: null, 
              session: null, 
              capabilities: [],
              isAuthenticated: false
            })
          }
        } catch (error) {
          console.error('Refresh session error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        capabilities: state.capabilities,
        lastActivity: state.lastActivity
      }),
    }
  )
) 