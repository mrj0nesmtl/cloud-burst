import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
} 