"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, BrainCircuit, Layers, Code, PenTool, Share2, Dices } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

export default function AIStudioPage() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', lineHeight: '1.25', letterSpacing: '-0.025em' }}>AI Studio</h2>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '8px' }}>
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
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '24px',
        width: '100%'
      }}>
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our AI Studio works
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <p>
              Cloud Burst's AI Studio is an advanced workspace for custom AI transformations
              of your event photos and videos. The studio can:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Create custom AI workflows</li>
              <li>Experiment with generative AI techniques</li>
              <li>Apply advanced style transfers</li>
              <li>Batch process media with AI</li>
              <li>Save and share custom AI presets</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dices className="h-5 w-5 text-primary" />
              Available Models
            </CardTitle>
            <CardDescription>
              AI models ready for your creative work
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Style Transfer</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Transform photos with artistic style references
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Image Expansion</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Extend photo backgrounds with AI generation
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Object Generation</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Add AI-generated objects to your photos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '16px' }}>Key Benefits</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : isMobile === false && window.innerWidth < 1024 
            ? 'repeat(2, 1fr)' 
            : 'repeat(3, 1fr)',
        gap: '16px',
        width: '100%'
      }}>
        <Card>
          <CardHeader style={{ paddingBottom: '8px' }}>
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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