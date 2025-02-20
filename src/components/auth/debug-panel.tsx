"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/config'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { diagnosticQueries } from '@/lib/supabase/debug-queries'

export function AuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<{
    env: boolean
    client: boolean
    session: any
    error: string | null
    lastAction: string | null
    tableChecks: {
      userProfiles: boolean
      authUsers: boolean
    }
  }>({
    env: false,
    client: false,
    session: null,
    error: null,
    lastAction: null,
    tableChecks: {
      userProfiles: false,
      authUsers: false
    }
  })

  const runDiagnostics = async () => {
    try {
      const envCheck = {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
      
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      setDebugInfo({
        env: envCheck.url && envCheck.key,
        client: !!supabase,
        session,
        error: error?.message || null,
        lastAction: 'Ran diagnostics'
      })
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastAction: 'Error in diagnostics'
      }))
    }
  }

  // Test login with test credentials
  const testLogin = async () => {
    try {
      const supabase = createClient()
      setDebugInfo(prev => ({ ...prev, lastAction: 'Attempting login...' }))
      
      // Let's test if the user exists first
      const { data: userExists, error: checkError } = await supabase.rpc(
        'check_user_exists',
        { email: 'test@example.com' }
      )

      setDebugInfo(prev => ({
        ...prev,
        lastAction: `User exists check: ${userExists ? 'Yes' : 'No'}`,
        error: checkError?.message || null
      }))

      // Only attempt login if we don't get an error checking user
      if (!checkError) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'test123'
        })

        setDebugInfo(prev => ({
          ...prev,
          session: data.session,
          error: error?.message || null,
          lastAction: error ? 'Login failed' : 'Login successful'
        }))
      }
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastAction: 'Login error'
      }))
    }
  }

  const runTableChecks = async () => {
    try {
      const supabase = createClient()
      setDebugInfo(prev => ({ 
        ...prev, 
        lastAction: 'Checking tables...',
        error: null 
      }))

      // Check user_profiles table
      const { data: profileExists, error: profileError } = await supabase
        .rpc('check_table_access', { table_name: 'user_profiles' })

      // Check auth.users table through a proxy function
      const { data: authExists, error: authError } = await supabase
        .rpc('check_auth_setup')

      setDebugInfo(prev => ({
        ...prev,
        tableChecks: {
          userProfiles: !profileError && profileExists,
          authUsers: !authError && authExists
        },
        error: profileError?.message || authError?.message || null,
        lastAction: 'Table checks complete'
      }))
    } catch (err) {
      console.error('Table check error:', err)
      setDebugInfo(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastAction: 'Table checks failed'
      }))
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card className="p-4 m-4 bg-secondary">
      <h2 className="text-lg font-bold mb-4">Auth Debug Panel</h2>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button size="sm" onClick={runDiagnostics}>
            Run Diagnostics
          </Button>
          <Button size="sm" variant="outline" onClick={testLogin}>
            Test Login
          </Button>
          <Button size="sm" variant="secondary" onClick={runTableChecks}>
            Check Tables
          </Button>
        </div>
        <pre className="text-sm whitespace-pre-wrap bg-black/10 p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </Card>
  )
} 