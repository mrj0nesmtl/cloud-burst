import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6" role="progressbar" aria-busy="true" aria-label="Loading admin dashboard">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" /> {/* Action button placeholder */}
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-[120px]" /> {/* Card title */}
            <Skeleton className="h-8 w-[80px]" />  {/* Stats number */}
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-[150px]" /> {/* Section title */}
        <div className="rounded-lg border p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" /> {/* Action button */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 