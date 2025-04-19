'use client'

import React, { useEffect } from 'react'

export default function HeaderSuppressor() {
  useEffect(() => {
    // Add a style tag to hide the global header in protected routes
    const style = document.createElement('style')
    style.innerHTML = `
      /* Hide the global SiteHeader in protected routes */
      main > div > header {
        display: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(style)
    }
  }, [])

  // This component doesn't render anything visible
  return null
} 