import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return (
    <div className="space-y-6" role="progressbar" aria-busy="true" aria-label="Loading events">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[120px]" /> {/* Primary action */}
          <Skeleton className="h-10 w-[100px]" /> {/* Secondary action */}
        </div>
      </div>
      
      {/* Events List */}
      <div className="rounded-lg border divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" /> {/* Event thumbnail */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-[250px]" /> {/* Event title */}
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-[100px]" /> {/* Date */}
                  <Skeleton className="h-4 w-[80px]" />  {/* Status */}
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9" /> {/* Action icon */}
                <Skeleton className="h-9 w-9" /> {/* Action icon */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 