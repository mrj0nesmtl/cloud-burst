"use client"

import { useEffect, useState } from "react"

export function DebugInfo() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/80 text-white p-4 z-[9999] flex flex-col gap-2">
      <h2 className="text-xl font-bold">Debug Info</h2>
      <p>Page is rendering: {mounted ? "Yes (Client)" : "Yes (Server)"}</p>
      <p>Current time: {new Date().toISOString()}</p>
      <p>Window size: {mounted ? `${window.innerWidth}x${window.innerHeight}` : "Unknown (Server)"}</p>
      <p>User Agent: {mounted ? navigator.userAgent : "Unknown (Server)"}</p>
    </div>
  )
} 