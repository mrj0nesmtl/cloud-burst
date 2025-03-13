import { Skeleton } from "@/components/ui/skeleton";

export default function QRCodesLoading() {
  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="border-b mb-4">
        <Skeleton className="h-10 w-64 mb-4" />
      </div>
      
      <div className="space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
} 