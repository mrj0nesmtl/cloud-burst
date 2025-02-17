import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User, Session, Provider, AuthError } from '@supabase/supabase-js'
import { createClient } from '../supabase/config'
import { toast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase/client'

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
            const { error } = await supabase.auth.signInWithPassword({
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