"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Sparkles, Wand2, ImagePlus, Palette, FileVideo2, ImageIcon, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

export default function EnhancementsPage() {
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
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', lineHeight: '1.25', letterSpacing: '-0.025em' }}>AI Enhancements</h2>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '8px' }}>
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
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '24px',
        width: '100%'
      }}>
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our AI enhancement technology works
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <p>
              Cloud Burst's AI enhancement system uses advanced neural networks to automatically
              improve your event photos. The system can:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Adjust lighting and exposure</li>
              <li>Enhance colors and contrast</li>
              <li>Reduce noise in low-light photos</li>
              <li>Sharpen details and improve clarity</li>
              <li>Apply artistic filters and styles</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Enhancement Options
            </CardTitle>
            <CardDescription>
              Available AI-powered enhancement tools
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Auto-Enhance</h4>
                  <Badge>Ready</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  One-click enhancement for lighting, color, and clarity
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Advanced Adjustments</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Fine-tune enhancement parameters manually
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '500' }}>Artistic Filters</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Apply professional styles and creative effects
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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