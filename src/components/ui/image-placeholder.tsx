"use client"

import React from 'react'
import { Calendar, Camera, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePlaceholderProps {
  type?: 'event' | 'photo' | 'gallery'
  className?: string
  title?: string
  iconSize?: number
  iconColor?: string
}

export function ImagePlaceholder({
  type = 'event',
  className,
  title,
  iconSize = 40,
  iconColor = 'currentColor'
}: ImagePlaceholderProps) {
  const Icon = type === 'event' 
    ? Calendar 
    : type === 'photo' 
      ? Camera 
      : ImageIcon

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-muted w-full h-full",
        className
      )}
    >
      <Icon size={iconSize} className={`text-muted-foreground/40 mb-2`} />
      {title && (
        <p className="text-xs text-muted-foreground/60 text-center px-4">
          {title}
        </p>
      )}
    </div>
  )
} 