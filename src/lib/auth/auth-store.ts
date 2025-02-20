import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User, Session, Provider, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/config'
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'organizer' | 'user'
  full_name?: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithSocial: (provider: Provider) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  
  // Session management
  initializeAuth: () => Promise<void>
  refreshSession: () => Promise<void>
  
  // State management
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
  clearError: () => void

  // New properties
  getRedirectPath: (role?: string) => string
}

// Create Supabase client only when needed
const getSupabase = () => {
  try {
    return createClient()
  } catch (error) {
    console.error('Supabase client initialization error:', error)
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      return {
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isInitialized: false,
        error: null,

        // State setters
        setUser: (user) => set({ user }),
        setSession: (session) => set({ session }),
        setError: (error) => {
          set({ error })
          if (error) toast({
            title: "Error",
            description: error
          })
        },
        setLoading: (isLoading) => set({ isLoading }),
        clearError: () => set({ error: null }),

        // Initialize auth state
        initializeAuth: async () => {
          try {
            set({ isLoading: true })
            
            // Initialize Supabase client
            const supabase = getSupabase()
            if (!supabase) {
              throw new Error('Failed to initialize Supabase client')
            }

            // Get session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.error('Session error:', sessionError)
              throw sessionError
            }
            
            if (session?.user) {
              try {
                // Fetch profile when session exists
                const { data: profile, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()

                if (profileError) {
                  console.error('Profile fetch error:', profileError)
                  throw profileError
                }

                set({ 
                  user: session.user,
                  profile,
                  session,
                  isInitialized: true 
                })

                // Set up auth state change listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                  async (event, session) => {
                    if (session?.user) {
                      const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                      set({ 
                        user: session.user,
                        profile,
                        session 
                      })
                    } else {
                      set({ 
                        user: null,
                        profile: null,
                        session: null 
                      })
                    }

                    if (event === 'SIGNED_IN') {
                      toast({
                        title: "Success",
                        description: "Signed in successfully"
                      })
                    }
                    if (event === 'SIGNED_OUT') {
                      toast({
                        title: "Success",
                        description: "Signed out successfully"
                      })
                    }
                  }
                )

                // Cleanup subscription on unmount
                return () => {
                  subscription.unsubscribe()
                }
              } catch (error) {
                console.error('Profile initialization error:', error)
                set({ 
                  user: session.user,
                  session,
                  isInitialized: true 
                })
              }
            } else {
              set({ 
                user: null,
                profile: null,
                session: null,
                isInitialized: true 
              })
            }
          } catch (err) {
            const error = err as AuthError
            console.error('Auth initialization error:', error)
            set({ 
              error: error.message,
              isInitialized: true 
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Refresh session
        refreshSession: async () => {
          try {
            set({ isLoading: true })
            const { data: { session }, error } = await supabase.auth.refreshSession()
            if (error) throw error
            set({ user: session?.user ?? null, session })
          } catch (err) {
            const error = err as AuthError
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        // Auth actions
        signIn: async (email: string, password: string) => {
          const supabase = createClient()
          set({ isLoading: true, error: null })

          try {
            console.log('Starting authentication...')
            
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            })

            if (error) throw error

            console.log('Auth successful:', data)

            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) throw profileError

            set({ 
              user: data.user,
              session: data.session,
              profile,
              error: null
            })

            toast({
              title: "Success",
              description: "Signed in successfully"
            })

            // Redirect based on role
            window.location.href = profile.role === 'super_admin' 
              ? '/protected/admin'
              : '/protected/dashboard'

          } catch (error: any) {
            console.error('Auth error:', error)
            set({ error: error.message })
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message
            })
          } finally {
            set({ isLoading: false })
          }
        },

        signUp: async (email: string, password: string) => {
          set({ isLoading: true, error: null })
          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
            })
            if (error) throw error
          } catch (error: any) {
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        signOut: async () => {
          const supabase = createClient()
          set({ isLoading: true })
          
          try {
            await supabase.auth.signOut()
            set({ user: null, session: null, profile: null })
            window.location.href = '/'
          } catch (error: any) {
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        resetPassword: async (email: string) => {
          try {
            set({ isLoading: true, error: null })
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/auth/reset-password`
            })
            if (error) throw error
            toast({
              title: "Success",
              description: "Password reset email sent"
            })
          } catch (err) {
            const error = err as AuthError
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        signInWithSocial: async (provider: Provider) => {
          set({ isLoading: true, error: null })
          try {
            const { error } = await supabase.auth.signInWithOAuth({
              provider,
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })
            if (error) throw error
          } catch (error: any) {
            set({ error: error.message })
          } finally {
            set({ isLoading: false })
          }
        },

        signInWithEmail: async (email: string, password: string) => {
          set({ isLoading: true })
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            if (error) throw error
          } catch (error: any) {
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        signUpWithEmail: async (email: string, password: string) => {
          set({ isLoading: true })
          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            })
            if (error) throw error
          } catch (error: any) {
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        // New properties
        getRedirectPath: (role?: string) => {
          switch (role) {
            case 'super_admin':
              return '/protected/admin'
            case 'admin':
              return '/protected/admin'
            case 'organizer':
              return '/protected/events'
            case 'user':
            default:
              return '/protected/dashboard'
          }
        },
      }
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

// Initialize auth only in browser environment
if (typeof window !== 'undefined') {
  const initAuth = () => {
    const store = useAuthStore.getState()
    if (!store.isInitialized) {
      store.initializeAuth()
    }
  }
  
  // Run after DOM is ready
  if (document.readyState === 'complete') {
    initAuth()
  } else {
    window.addEventListener('load', initAuth)
  }
}

export const checkAuthSession = async () => {
  const store = useAuthStore.getState()
  if (!store.isInitialized) {
    await store.initializeAuth()
  }
  return {
    user: store.user,
    profile: store.profile,
    session: store.session,
    isLoading: store.isLoading
  }
} 