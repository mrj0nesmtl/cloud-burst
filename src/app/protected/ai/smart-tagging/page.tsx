"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Tags, Search, Filter, Clock, LayoutList, ListFilter, InfoIcon, Tag, Layers, FolderSearch, Heart, Users, Camera, TreePine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SmartTaggingPage() {
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
    <div className="container py-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Tagging</h1>
            <p className="text-muted-foreground">
              Automated content tagging and organization powered by AI
            </p>
          </div>
          <Badge className="bg-blue-500">Beta</Badge>
        </div>
        
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Beta Feature</AlertTitle>
          <AlertDescription>
            Smart Tagging is currently in beta. We're actively improving the accuracy and feature set.
          </AlertDescription>
        </Alert>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '24px',
        width: '100%' 
      }}>
        <Card className="bg-card hover:bg-accent/40 transition-colors">
          <CardHeader>
            <CardTitle>Intelligent Content Organization</CardTitle>
            <CardDescription>
              Automatically tag and categorize photos and videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-primary/10 p-4">
              <div className="font-semibold">Advanced Recognition</div>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI can recognize objects, scenes, activities, and even emotions in your content
              </p>
            </div>
            <div className="rounded-md bg-primary/10 p-4">
              <div className="font-semibold">Searchable Collections</div>
              <p className="text-sm text-muted-foreground mt-1">
                Find exactly what you're looking for with powerful tag-based search functionality
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/protected/ai/smart-tagging/demo">
                Try the beta
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card hover:bg-accent/40 transition-colors">
          <CardHeader>
            <CardTitle>Tag Categories</CardTitle>
            <CardDescription>
              Our smart tagging system recognizes multiple categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Objects & Scenes</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify common objects, locations, and scene compositions
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Emotions & Expressions</h3>
                  <p className="text-sm text-muted-foreground">
                    Detect emotional expressions to find those perfect moments
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Custom Tags</h3>
                  <p className="text-sm text-muted-foreground">
                    Train the system to recognize event-specific elements
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%' 
        }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Saving</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically organize large collections of photos without manual tagging
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enhanced Discoverability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Make it easy for clients to find specific photos within event collections
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Improved Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Streamline your post-event processing with intelligent content organization
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Smart Tagging Usage</h3>
        <ol className="space-y-2 list-decimal list-inside text-sm">
          <li className="text-muted-foreground">Upload your content to Cloud Burst</li>
          <li className="text-muted-foreground">Enable Smart Tagging in your event settings</li>
          <li className="text-muted-foreground">Our AI will process and tag your content automatically</li>
          <li className="text-muted-foreground">Review and adjust tags as needed</li>
          <li className="text-muted-foreground">Enjoy powerful search and filtering capabilities</li>
        </ol>
        <div className="mt-4">
          <Button asChild>
            <Link href="/protected/events">
              Try on your events
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 