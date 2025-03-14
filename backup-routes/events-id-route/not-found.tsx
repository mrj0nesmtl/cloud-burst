import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Search } from 'lucide-react'

export default function EventNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/10 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Event Not Found</h1>
        
        <p className="text-muted-foreground mb-8">
          The event you're looking for doesn't exist, isn't public, or hasn't been published yet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-blue-500 hover:bg-blue-600" asChild>
            <Link href="/events">
              <Search className="mr-2 h-4 w-4" />
              Browse Public Events
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 