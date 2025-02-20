"use client"

import { usePermissions } from '@/hooks/use-permissions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function AuthDebug() {
  // Only render in development
  if (process.env.NODE_ENV === 'production') return null
  
  const supabase = createClientComponentClient()
  const { role, capabilities } = usePermissions()

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <p>Role: {role}</p>
        <p>Capabilities: {capabilities.join(', ')}</p>
      </div>
    </div>
  )
} 