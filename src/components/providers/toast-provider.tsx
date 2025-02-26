'use client'

import { Toaster } from "@/components/ui/toaster"

export function ToastProvider() {
  // Don't render toaster in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return <Toaster />
} 