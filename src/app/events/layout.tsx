import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CloudLightning } from 'lucide-react'
import { ReactNode } from 'react'

interface EventsLayoutProps {
  children: ReactNode
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  // Remove any navigation components here if they exist
  // The main navigation should be in the root layout.tsx
  
  return (
    <>
      {children}
    </>
  )
} 