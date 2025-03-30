"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, ArrowRight, Loader2, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react'

export default function ProductPlacementsPage() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className="container py-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Placements</h1>
            <p className="text-muted-foreground">
              Smart product placement and brand integration for your event photos
            </p>
          </div>
          <Badge className="bg-yellow-500">Coming Soon</Badge>
        </div>
        
        <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>In Development</AlertTitle>
          <AlertDescription>
            The Product Placements feature is currently in development and will be available soon.
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
            <CardTitle>AI-Powered Product Placement</CardTitle>
            <CardDescription>
              Seamlessly integrate sponsored products into your event photographs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-primary/10 p-4">
              <div className="font-semibold">Smart Technology</div>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI identifies optimal placement opportunities that look natural and on-brand
              </p>
            </div>
            <div className="rounded-md bg-primary/10 p-4">
              <div className="font-semibold">Revenue Opportunities</div>
              <p className="text-sm text-muted-foreground mt-1">
                Create new sponsorship tiers and revenue streams for your events
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Learn implementation details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card hover:bg-accent/40 transition-colors">
          <CardHeader>
            <CardTitle>Placement Options</CardTitle>
            <CardDescription>
              Multiple ways to integrate sponsored products into your event media
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Product Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Natural placement of sponsor products in appropriate contexts
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Branded Elements</h3>
                  <p className="text-sm text-muted-foreground">
                    Add branded decorative elements that complement the event theme
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Engagement Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track view and interaction metrics for each product placement
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
              <CardTitle className="text-lg">New Revenue Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create additional income by offering product placement packages to sponsors and partners.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Natural Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI ensures products are placed in contextually appropriate and visually pleasing ways.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Measurable Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics help you demonstrate ROI to sponsors and optimize future placements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Feature Coming Soon
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        <p>
          Interested in learning more about this upcoming feature?{' '}
          <Link href="/protected/contact" className="text-primary underline underline-offset-4">
            Contact our team
          </Link>{' '}
          for more information.
        </p>
      </div>
    </div>
  )
} 