'use client'

import { useState, useEffect } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function TanstackQueryDevtools() {
  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // Only load devtools in development
    if (process.env.NODE_ENV === 'development') {
      setShowDevtools(true)
    }
  }, [])

  return showDevtools ? <ReactQueryDevtools /> : null
} 