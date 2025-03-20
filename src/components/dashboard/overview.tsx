'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 3,
  },
  {
    name: "Feb",
    total: 2,
  },
  {
    name: "Mar",
    total: 6,
  },
  {
    name: "Apr",
    total: 4,
  },
  {
    name: "May",
    total: 4,
  },
  {
    name: "Jun",
    total: 3,
  },
  {
    name: "Jul",
    total: 2,
  },
  {
    name: "Aug",
    total: 5,
  },
  {
    name: "Sep",
    total: 4,
  },
  {
    name: "Oct",
    total: 4,
  },
  {
    name: "Nov",
    total: 5,
  },
  {
    name: "Dec",
    total: 2,
  },
]

export function Overview() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Month
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Events
                        </span>
                        <span className="font-bold">
                          {payload[0].value}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "#2563eb", opacity: 0.8 }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 