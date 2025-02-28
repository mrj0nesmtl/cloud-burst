import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { AuthState, Capability, UserRole } from '@/types/auth'
import { roleCapabilities } from '@/types/auth'
import { createClient, handleError } from './client'

interface AuthStore extends AuthState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  
  // State management
  setUser: (user: AuthState['user']) => void
  setSession: (session: AuthState['session']) => void
  setLoading: (loading: boolean) => void
  setCapabilities: (capabilities: Capability[]) => void
  
  // Permission checks
  hasCapability: (capability: Capability) => boolean
  hasRole: (role: UserRole) => boolean
  
  // New methods
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      capabilities: [],

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setCapabilities: (capabilities) => set({ capabilities }),

      hasCapability: (capability) => {
        const { capabilities } = get()
        return capabilities.includes(capability) || capabilities.includes('manage:all')
      },

      hasRole: (role) => {
        return get().user?.role === role
      },

      signIn: async (email, password) => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const session = await handleError(
            supabase.auth.signInWithPassword({ email, password })
          )
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          // Fetch role capabilities
          const { data: rolePerms } = await supabase
            .from('role_capabilities')
            .select('capability')
            .eq('role', profile?.role)

          set({ 
            user: profile,
            session: session,
            capabilities: rolePerms?.map(p => p.capability as Capability) ?? []
          })
        } catch (error) {
          console.error('Sign in error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
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
              capabilities: roleCapabilities.user
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
            capabilities: []
          })
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

      initialize: async () => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            // Fetch role capabilities
            const { data: rolePerms } = await supabase
              .from('role_capabilities')
              .select('capability')
              .eq('role', profile?.role)

            set({ 
              user: profile,
              session: session,
              capabilities: rolePerms?.map(p => p.capability as Capability) ?? []
            })
          }
        } catch (error) {
          console.error('Initialize error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      refreshSession: async () => {
        const supabase = createClientComponentClient()
        try {
          set({ loading: true })
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            // Fetch role capabilities
            const { data: rolePerms } = await supabase
              .from('role_capabilities')
              .select('capability')
              .eq('role', profile?.role)

            set({ 
              user: profile,
              session: session,
              capabilities: rolePerms?.map(p => p.capability as Capability) ?? []
            })
          } else {
            set({ 
              user: null, 
              session: null, 
              capabilities: []
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
        capabilities: state.capabilities
      }),
    }
  )
) 