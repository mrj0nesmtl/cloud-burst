import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[200px]" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    </div>
  )
} 