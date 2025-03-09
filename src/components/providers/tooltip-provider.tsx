"use client"

import React from 'react'
import { TooltipProvider as TooltipProviderComponent } from '@/components/ui/tooltip'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProviderComponent delayDuration={300}>
      {children}
    </TooltipProviderComponent>
  )
} 