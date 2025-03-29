import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ShoppingBag, ImageDown, BarChart3, DollarSign, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Product Placements | AI Features | Cloud Burst',
  description: 'Smart product placement and brand integration for event photos',
}

export default function ProductPlacementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Placements</h2>
          <p className="text-muted-foreground mt-2">
            Smart product placement and brand integration for event photos
          </p>
        </div>
        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
          Coming Soon
        </Badge>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Feature in development</AlertTitle>
        <AlertDescription>
          This feature is currently in development and will be available in an upcoming release.
          Join our beta program to get early access.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our product placement technology works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cloud Burst's product placement technology uses AI to seamlessly integrate branded 
              products into your event photos. The system can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identify optimal placement locations in photos</li>
              <li>Naturally integrate sponsor products</li>
              <li>Replace existing products with sponsored alternatives</li>
              <li>Add branded overlays and watermarks</li>
              <li>Track engagement with placed products</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Placement Options
            </CardTitle>
            <CardDescription>
              Flexible integration options for sponsors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Choose from various placement strategies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Natural Integration - blend products into scenes</li>
              <li>Surface Replacement - replace existing surfaces with branding</li>
              <li>Background Placement - add branded elements to backgrounds</li>
              <li>Digital Overlays - add digital effects with sponsor branding</li>
              <li>Custom Watermarks - subtle branded watermarking</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Key Benefits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              New Revenue Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Create additional monetization opportunities by offering branded photo content to sponsors.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageDown className="h-5 w-5 text-primary" />
              Non-Intrusive Advertising
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Deliver advertising value without disrupting the authentic feel of event photos.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Track engagement metrics on product placements to demonstrate ROI to sponsors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 