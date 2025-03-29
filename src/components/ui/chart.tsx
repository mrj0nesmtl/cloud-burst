"use client"

import * as React from "react"
import { TooltipProps } from "recharts"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps {
  children: React.ReactNode
  config: ChartConfig
  className?: string
}

export function ChartContainer({
  children,
  config,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={className}
      style={
        {
          "--color-desktop": config.desktop?.color,
          "--color-mobile": config.mobile?.color,
        } as React.CSSProperties
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface ChartTooltipProps extends TooltipProps<number, string> {
  cursor?: boolean
}

export function ChartTooltip({
  cursor = false,
  content,
  ...props
}: ChartTooltipProps) {
  return <Tooltip cursor={cursor} content={content} {...props} />
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: any }>
  label?: string
  labelFormatter?: (value: string) => string
  valueFormatter?: (value: number) => string
  indicator?: "line" | "dot"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  indicator = "line",
}: ChartTooltipContentProps) {
  if (!active || !payload) {
    return null
  }

  const formattedLabel = labelFormatter ? labelFormatter(label!) : label

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-1">
          <div className="font-medium">{formattedLabel}</div>
        </div>
        <div className="grid gap-1">
          {payload.map((data, i) => {
            const value = valueFormatter
              ? valueFormatter(data.value)
              : data.value
            return (
              <div key={i} className="flex items-center gap-2">
                {indicator === "line" ? (
                  <div
                    className="h-[3px] w-6"
                    style={{ backgroundColor: data.payload.fill || data.color }}
                  />
                ) : (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: data.payload.fill || data.color }}
                  />
                )}
                <div className="flex items-center gap-1">
                  <div>{data.name}</div>
                  <div className="font-medium">{value}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ChartLegend({ content, ...props }: any) {
  return <Legend content={content} {...props} />
}

export function ChartLegendContent(props: any) {
  const { payload } = props

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
      {payload &&
        payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="h-2 w-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
          </div>
        ))}
    </div>
  )
} 