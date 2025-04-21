'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    mediaQuery.addEventListener('change', handler)

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [query])

  return matches
} 