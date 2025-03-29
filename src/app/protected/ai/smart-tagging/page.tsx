import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Tags, Search, Filter, Clock, LayoutList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Smart Tagging | AI Features | Cloud Burst',
  description: 'Automated content tagging and organization powered by AI',
}

export default function SmartTaggingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Smart Tagging</h2>
          <p className="text-muted-foreground mt-2">
            Automated content tagging and organization powered by AI
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          Beta
        </Badge>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Beta Feature</AlertTitle>
        <AlertDescription>
          Smart Tagging is currently in beta. While fully functional, we're actively improving its accuracy and adding new capabilities.
          We welcome your feedback to help us refine this feature.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our smart tagging technology works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cloud Burst's Smart Tagging uses computer vision and machine learning to automatically
              analyze and tag photos and videos from your events. The system can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recognize objects, scenes, and activities</li>
              <li>Identify colors, styles, and compositions</li>
              <li>Detect emotions and expressions</li>
              <li>Recognize event-specific elements (cake cutting, first dance, etc.)</li>
              <li>Create custom tags based on your event details</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutList className="h-5 w-5 text-primary" />
              Tag Categories
            </CardTitle>
            <CardDescription>
              The types of tags our system can generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Smart Tagging automatically categorizes content with various tag types:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content Tags - what's in the photo (people, objects, activities)</li>
              <li>Technical Tags - qualities of the photo (lighting, composition, quality)</li>
              <li>Emotional Tags - mood and feeling of the photo (joyful, intimate, exciting)</li>
              <li>Event Tags - event-specific moments (speech, performance, group photo)</li>
              <li>Custom Tags - based on your specific event details</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Key Benefits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Enhanced Searchability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Find exactly what you're looking for with powerful semantic search across all your media.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Eliminate the need for manual tagging while maintaining comprehensive organization.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Smart Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Create powerful filtered views and collections based on automatically generated tags.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 