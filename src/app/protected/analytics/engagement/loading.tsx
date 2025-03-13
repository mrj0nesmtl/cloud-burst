import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

export default function EngagementAnalyticsLoading() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-md" />
          ))}
        </div>
        
        <Skeleton className="h-[350px] w-full rounded-md" />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full rounded-md" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </div>
        
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    </div>
  )
} 