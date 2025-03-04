"use client"

import React from 'react'

interface ChartProps {
  data: any[]
  height?: number
  width?: number
  className?: string
}

export function BarChart({ data, height = 300, width = 500, className }: ChartProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`} style={{ height, width }}>
      <p>Bar Chart Placeholder</p>
    </div>
  )
}

export function LineChart({ data, height = 300, width = 500, className }: ChartProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`} style={{ height, width }}>
      <p>Line Chart Placeholder</p>
    </div>
  )
}

export function PieChart({ data, height = 300, width = 300, className }: ChartProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`} style={{ height, width }}>
      <p>Pie Chart Placeholder</p>
    </div>
  )
} 