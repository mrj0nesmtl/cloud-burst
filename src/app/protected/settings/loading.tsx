import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-8" role="progressbar" aria-busy="true" aria-label="Loading settings">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
      </div>
      
      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Profile Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-[120px]" /> {/* Section title */}
          <div className="rounded-lg border p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" /> {/* Avatar */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-[100px]" />
          <div className="rounded-lg border p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-6 w-11" /> {/* Toggle */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 