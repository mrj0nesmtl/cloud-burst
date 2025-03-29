import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Cpu, UserSearch, Tag, Users, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Facial Recognition | AI Features | Cloud Burst',
  description: 'Intelligent face detection and recognition for your event photos',
}

export default function FacialRecognitionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facial Recognition</h2>
          <p className="text-muted-foreground mt-2">
            Intelligent face detection and recognition for your event photos
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
              <Cpu className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our facial recognition technology works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cloud Burst's facial recognition system uses advanced AI algorithms to detect,
              analyze, and identify faces in your event photos. The system can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Automatically detect faces in photos</li>
              <li>Group similar faces across multiple photos</li>
              <li>Match faces to your attendee list</li>
              <li>Create searchable tags for people</li>
              <li>Respect privacy settings and consent</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              How we protect your data and respect privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We take privacy and security seriously. Our facial recognition system:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only processes photos you explicitly select</li>
              <li>Requires opt-in consent from event attendees</li>
              <li>Stores facial data securely and encrypted</li>
              <li>Allows users to delete their facial data at any time</li>
              <li>Complies with privacy regulations like GDPR and CCPA</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Key Benefits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserSearch className="h-5 w-5 text-primary" />
              Simplified Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Quickly find all photos containing specific people without manual tagging.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Automated Tagging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Save hours of manual work with AI-powered face detection and tagging.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Attendee Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Gain insights into attendee participation and engagement through photo presence.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 