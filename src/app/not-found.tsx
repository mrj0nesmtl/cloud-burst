import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CloudLightning, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/10 p-4 rounded-full">
            <CloudLightning className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-blue-500 hover:bg-blue-600" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/events">
              <Search className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 