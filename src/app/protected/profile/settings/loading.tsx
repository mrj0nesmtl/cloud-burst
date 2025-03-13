import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

export default function ProfileSettingsLoading() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Skeleton className="h-8 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      <div className="space-y-6">
        <Skeleton className="h-[450px] w-full" />
      </div>
    </div>
  )
}
