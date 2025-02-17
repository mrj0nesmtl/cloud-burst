import { PostgrestError } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import { AuthState, UserProfile } from '@/types/auth'

interface AuthContextValue extends AuthState {
  error?: PostgrestError | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    user: null,
    session: null,
    loading: true,
    capabilities: [],
    error: null
  })

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(s => ({ ...s, session, loading: false }))
        // Fetch user profile
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) setState(s => ({ ...s, error }))
            if (data) setState(s => ({ ...s, user: data }))
          })
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(s => ({ ...s, session, loading: true }))
        if (session) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) setState(s => ({ ...s, error }))
          if (data) setState(s => ({ ...s, user: data }))
        }
        setState(s => ({ ...s, loading: false }))
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}