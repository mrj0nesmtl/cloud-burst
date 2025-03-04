"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 1, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        paddingBottom: `${100 / ratio}%`,
        ...style,
      }}
      className={cn("relative w-full", className)}
      {...props}
    />
  )
)
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
