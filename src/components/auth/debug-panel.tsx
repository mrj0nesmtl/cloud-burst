"use client"

import { usePermissions } from '@/hooks/use-permissions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export function DebugPanel() {
  // Only render in development
  if (process.env.NODE_ENV === 'production') return null

  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClientComponentClient()
  const { role, capabilities } = usePermissions()

  return (
    <div className="fixed top-4 right-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/80 text-white p-2 rounded-lg text-xs"
      >
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-black/80 text-white rounded-lg text-xs">
          <h3 className="font-bold mb-2">Auth Debug Panel</h3>
          <div className="space-y-2">
            <div>
              <strong>Role:</strong> {role}
            </div>
            <div>
              <strong>Capabilities:</strong>
              <ul className="ml-2">
                {capabilities.map(cap => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 