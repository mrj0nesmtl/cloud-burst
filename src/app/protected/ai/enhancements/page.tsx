import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Sparkles, Wand2, ImagePlus, Palette, FileVideo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'AI Enhancements | AI Features | Cloud Burst',
  description: 'Automated photo and video enhancement powered by AI',
}

export default function EnhancementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Enhancements</h2>
          <p className="text-muted-foreground mt-2">
            Automated photo and video enhancement powered by AI
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
              <Sparkles className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our AI enhancement technology works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cloud Burst's enhancement technology uses advanced AI algorithms to automatically improve
              the quality of your photos and videos. The system can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enhance lighting and contrast</li>
              <li>Improve sharpness and detail</li>
              <li>Reduce noise in low-light photos</li>
              <li>Stabilize shaky video footage</li>
              <li>Apply intelligent color correction</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Enhancement Options
            </CardTitle>
            <CardDescription>
              Choose from various enhancement styles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Customize your enhancements with various preset styles:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Natural - subtle improvements that look authentic</li>
              <li>Vivid - enhanced colors and contrast for impactful visuals</li>
              <li>Artistic - stylized enhancements for creative looks</li>
              <li>Professional - calibrated for print and professional use</li>
              <li>Custom - fine-tune settings to your exact preferences</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-semibold mt-8">Key Benefits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Batch Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Enhance hundreds of photos at once with consistent quality and style.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Style Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Ensure all event photos have a consistent look and feel across different cameras.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileVideo2 className="h-5 w-5 text-primary" />
              Video Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Automatically enhance video footage with AI-powered stabilization and color grading.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 