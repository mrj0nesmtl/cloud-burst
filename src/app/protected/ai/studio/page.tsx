import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, BrainCircuit, Layers, Code, PenTool, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'AI Studio | AI Features | Cloud Burst',
  description: 'Advanced AI workspace for custom photo and video transformations',
}

export default function AIStudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Studio</h2>
          <p className="text-muted-foreground mt-2">
            Advanced AI workspace for custom photo and video transformations
          </p>
        </div>
        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">
          New
        </Badge>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Experimental Playground</AlertTitle>
        <AlertDescription>
          AI Studio is our experimental playground for the latest AI technologies. 
          Features may change as we refine capabilities based on user feedback.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              What you can do in AI Studio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              AI Studio is a creative workspace where you can experiment with advanced 
              AI transformations for your event media. The studio enables you to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create custom AI workflows for media processing</li>
              <li>Experiment with cutting-edge generative AI techniques</li>
              <li>Design and save custom enhancement presets</li>
              <li>Batch process media with custom transformations</li>
              <li>Preview transformations before applying them</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Available Models
            </CardTitle>
            <CardDescription>
              AI models available in the studio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              AI Studio provides access to various models for different use cases:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Image Enhancement - upscaling, noise reduction, clarity</li>
              <li>Style Transfer - apply artistic styles to event photos</li>
              <li>Background Manipulation - replace or enhance backgrounds</li>
              <li>Text-to-Image - generate custom elements from descriptions</li>
              <li>Inpainting - intelligently repair or modify image sections</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Key Benefits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Workflow Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Create and save custom AI processing workflows for consistent results across all your events.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              Creative Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Fine-tune AI parameters to achieve your exact creative vision for event photography.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Preset Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Share custom AI presets with team members to maintain consistent style across all event media.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 