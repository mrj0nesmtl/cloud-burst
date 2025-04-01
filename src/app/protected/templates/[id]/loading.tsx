"use client"

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function TemplatePreviewLoading() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Button variant="ghost" size="sm" asChild style={{ marginRight: '16px' }}>
          <Link href="/protected/templates">
            <ArrowLeft style={{ marginRight: '8px', width: '16px', height: '16px' }} />
            Back to Templates
          </Link>
        </Button>
        <Skeleton style={{ height: '28px', width: '180px' }} />
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr' : '1fr 2fr'),
        gap: isMobile ? '16px' : '24px',
        width: '100%'
      }}>
        {/* Template Overview Card - Skeleton */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader style={{ paddingBottom: '16px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Skeleton style={{ height: '64px', width: '64px', borderRadius: '9999px' }} />
              <Skeleton style={{ height: '24px', width: '120px', marginTop: '16px' }} />
              <Skeleton style={{ height: '16px', width: '90px', marginTop: '8px' }} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
            <Skeleton style={{ height: '16px', width: '100%', marginBottom: '16px' }} />
            
            <Skeleton style={{ height: '20px', width: '90px', marginBottom: '12px' }} />
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                <Skeleton style={{ height: '16px', width: '120px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                <Skeleton style={{ height: '16px', width: '150px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                <Skeleton style={{ height: '16px', width: '135px' }} />
              </div>
            </div>
          </CardContent>
          <CardFooter style={{ 
            borderTop: '1px solid var(--border)', 
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Skeleton style={{ height: '36px', width: '120px' }} />
          </CardFooter>
        </Card>
        
        {/* Template Details Card - Skeleton */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader>
            <Skeleton style={{ height: '24px', width: '140px' }} />
            <Skeleton style={{ height: '16px', width: '180px', marginTop: '4px' }} />
          </CardHeader>
          <CardContent style={{ padding: isMobile ? '16px' : '24px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}>
              <Skeleton style={{ height: '16px', width: '100%' }} />
              <Skeleton style={{ height: '16px', width: '100%' }} />
              <Skeleton style={{ height: '16px', width: '75%' }} />
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                marginTop: '8px' 
              }}>
                <Skeleton style={{ height: '20px', width: '120px' }} />
                <Skeleton style={{ height: '16px', width: '100%' }} />
                <Skeleton style={{ height: '16px', width: '100%' }} />
                <Skeleton style={{ height: '16px', width: '66%' }} />
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginTop: '8px'
              }}>
                <Skeleton style={{ height: '20px', width: '120px' }} />
                <Skeleton style={{ height: '16px', width: '100%' }} />
                <Skeleton style={{ height: '20px', width: '120px' }} />
                <Skeleton style={{ height: '16px', width: '100%' }} />
                <Skeleton style={{ height: '20px', width: '120px' }} />
                <Skeleton style={{ height: '16px', width: '100%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 