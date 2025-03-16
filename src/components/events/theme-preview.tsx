"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { Calendar, User, Users } from 'lucide-react'

interface ThemePreviewProps {
  theme: 'light' | 'dark' 
  className?: string
}

export function ThemePreview({ theme, className }: ThemePreviewProps) {
  const [mounted, setMounted] = useState(false)
  
  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return (
    <div className={cn("relative h-[140px] w-full rounded-md overflow-hidden", className)}>
      <Card 
        className={cn(
          "absolute inset-0 border transition-colors",
          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <CardContent className="p-3">
          {/* Header with title and badge */}
          <div className="flex justify-between items-center mb-3">
            <div 
              className={cn(
                "h-5 w-32 rounded-md",
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              )}
            />
            <div 
              className={cn(
                "h-5 w-16 rounded-full text-xs px-2 flex items-center justify-center text-white",
                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
              )}
            >
              <span className="text-[10px]">Preview</span>
            </div>
          </div>
          
          {/* Content with icon details */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className={cn("h-3 w-3 mr-2", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')} />
              <div 
                className={cn(
                  "h-3 w-24 rounded-sm",
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                )}
              />
            </div>
            <div className="flex items-center">
              <User className={cn("h-3 w-3 mr-2", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')} />
              <div 
                className={cn(
                  "h-3 w-32 rounded-sm",
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                )}
              />
            </div>
            <div className="flex items-center">
              <Users className={cn("h-3 w-3 mr-2", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')} />
              <div 
                className={cn(
                  "h-3 w-16 rounded-sm",
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                )}
              />
            </div>
          </div>
          
          {/* Buttons at bottom */}
          <div className="mt-4 flex justify-end">
            <div 
              className={cn(
                "h-6 w-20 rounded-md mr-2",
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              )}
            />
            <div 
              className={cn(
                "h-6 w-20 rounded-md",
                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 