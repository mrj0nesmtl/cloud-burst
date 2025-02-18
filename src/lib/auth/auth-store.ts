import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User, Session, Provider, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/config'
import { toast } from "@/hooks/use-toast"

interface AuthState {
  user: User | null
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const supabase = createClient()
      
      return {
        user: null,
        session: null,
        isLoading: true,
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
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error
            
            if (session) {
              set({ 
                user: session.user,
                session,
                isInitialized: true 
              })
              // Set up auth state change listener
              supabase.auth.onAuthStateChange((event, session) => {
                set({ user: session?.user ?? null, session })
                if (event === 'SIGNED_IN') toast({
                  title: "Success",
                  description: "Signed in successfully"
                })
                if (event === 'SIGNED_OUT') toast({
                  title: "Success",
                  description: "Signed out successfully"
                })
              })
            }
          } catch (err) {
            const error = err as AuthError
            set({ error: error.message })
          } finally {
            set({ isLoading: false, isInitialized: true })
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
          set({ isLoading: true, error: null })
          
          try {
            console.log('1. Starting sign in process...', { email }) // Debug point 1
            
            const supabase = createClient()
            console.log('2. Supabase client created', { 
              url: process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
            }) // Debug point 2
            
            console.log('3. Attempting signInWithPassword...') // Debug point 3
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            
            console.log('4. Sign in response:', { 
              hasData: !!data,
              hasUser: !!data?.user,
              hasSession: !!data?.session,
              error 
            }) // Debug point 4
            
            if (error) {
              console.error('5. Supabase error:', error) // Debug point 5
              throw error
            }
            
            if (!data.user || !data.session) {
              console.error('6. Missing user or session:', { data }) // Debug point 6
              throw new Error('No user or session returned')
            }
            
            console.log('7. Setting user and session...') // Debug point 7
            set({ 
              user: data.user,
              session: data.session
            })
            
            console.log('8. Showing success toast...') // Debug point 8
            toast({
              title: "Success",
              description: "Signed in successfully"
            })
            
            console.log('9. Redirecting to dashboard...') // Debug point 9
            window.location.href = '/protected/dashboard'
            
          } catch (error: any) {
            console.error('ERROR in sign in process:', {
              name: error.name,
              message: error.message,
              stack: error.stack,
              details: error.details,
              hint: error.hint,
              code: error.code
            }) // Detailed error logging
            
            set({ error: error.message })
            toast({
              title: "Error",
              description: error.message || 'An error occurred during sign in',
              variant: "destructive"
            })
          } finally {
            set({ isLoading: false })
            console.log('10. Sign in process completed') // Debug point 10
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
          try {
            set({ isLoading: true, error: null })
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            set({ user: null, session: null })
          } catch (err) {
            const error = err as AuthError
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
      }
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isInitialized: state.isInitialized 
      }),
    }
  )
)

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth()
}

export const checkAuthSession = async () => {
  const store = useAuthStore.getState()
  if (!store.isInitialized) {
    await store.initializeAuth()
  }
  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading
  }
} 