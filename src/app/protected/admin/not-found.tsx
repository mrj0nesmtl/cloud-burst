import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">
          The admin page you're looking for doesn't exist. Please check the URL or navigate back to the dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/protected/admin">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/protected">Back to Main App</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 