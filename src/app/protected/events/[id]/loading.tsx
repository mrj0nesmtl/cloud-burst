import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EventLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <div className="flex items-center mt-2 space-x-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-[70px]" />
          <Skeleton className="h-9 w-[90px]" />
          <Skeleton className="h-9 w-[80px]" />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
