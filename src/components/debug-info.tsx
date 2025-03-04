"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function DebugInfo() {
  const [mounted, setMounted] = useState(false)
  const [cssLoaded, setCssLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [windowSize, setWindowSize] = useState("")
  const [userAgent, setUserAgent] = useState("")
  const { theme, resolvedTheme } = useTheme()
  
  useEffect(() => {
    // Set mounted state
    setMounted(true)
    
    // Set time-sensitive values only after mounting to prevent hydration mismatch
    setCurrentTime(new Date().toISOString())
    setWindowSize(`${window.innerWidth}x${window.innerHeight}`)
    setUserAgent(navigator.userAgent)
    
    // Set up interval to update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString())
    }, 1000)
    
    // Check if CSS is loaded properly
    const styleSheets = document.styleSheets
    let tailwindLoaded = false
    
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        // Check for tailwind classes in stylesheet
        const rules = styleSheets[i].cssRules || styleSheets[i].rules
        for (let j = 0; j < rules.length; j++) {
          if (rules[j].cssText && rules[j].cssText.includes('--background')) {
            tailwindLoaded = true
            break
          }
        }
      } catch (e) {
        // Ignore CORS errors from accessing cross-origin stylesheets
      }
    }
    
    setCssLoaded(tailwindLoaded)
    
    // Clean up interval on unmount
    return () => clearInterval(timeInterval)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/80 text-white p-4 z-[9999] flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Debug Info</h2>
        <div className="flex gap-2">
          <div className={`h-4 w-4 rounded-full ${mounted ? 'bg-green-500' : 'bg-red-500'}`} title="Client Mounted"></div>
          <div className={`h-4 w-4 rounded-full ${cssLoaded ? 'bg-green-500' : 'bg-red-500'}`} title="CSS Loaded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <p><span className="font-semibold">Page Rendering:</span> {mounted ? "Yes (Client)" : "Yes (Server)"}</p>
        <p><span className="font-semibold">CSS Loaded:</span> {cssLoaded ? "Yes" : "No"}</p>
        {mounted && (
          <>
            <p><span className="font-semibold">Current Time:</span> {currentTime}</p>
            <p><span className="font-semibold">Theme:</span> {theme} ({resolvedTheme})</p>
            <p><span className="font-semibold">Window Size:</span> {windowSize}</p>
            <p><span className="font-semibold">User Agent:</span> {userAgent}</p>
            <p><span className="font-semibold">Node Env:</span> {process.env.NODE_ENV}</p>
            <p><span className="font-semibold">Next Version:</span> {(window as any).__NEXT_DATA__?.buildId ? `Build: ${(window as any).__NEXT_DATA__.buildId}` : "Unknown"}</p>
          </>
        )}
      </div>
    </div>
  )
} 