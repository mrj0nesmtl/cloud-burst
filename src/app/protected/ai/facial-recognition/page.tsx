"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Cpu, UserSearch, Tag, Users, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

export default function FacialRecognitionPage() {
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
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', lineHeight: '1.25', letterSpacing: '-0.025em' }}>Facial Recognition</h2>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '8px' }}>
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
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '24px',
        width: '100%'
      }}>
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Feature Overview
            </CardTitle>
            <CardDescription>
              How our facial recognition technology works
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <p>
              Cloud Burst's facial recognition system uses advanced AI algorithms to detect,
              analyze, and identify faces in your event photos. The system can:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Automatically detect faces in photos</li>
              <li>Group similar faces across multiple photos</li>
              <li>Match faces to your attendee list</li>
              <li>Create searchable tags for people</li>
              <li>Respect privacy settings and consent</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              How we protect your data and respect privacy
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            <p>
              We take privacy and security seriously. Our facial recognition system:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Only processes photos you explicitly select</li>
              <li>Requires opt-in consent from event attendees</li>
              <li>Stores facial data securely and encrypted</li>
              <li>Allows users to delete their facial data at any time</li>
              <li>Complies with privacy regulations like GDPR and CCPA</li>
            </ul>
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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
          <CardHeader style={{ paddingBottom: '8px' }}>
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