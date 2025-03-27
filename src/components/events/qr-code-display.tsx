"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Share2, RefreshCw } from 'lucide-react'
import { generateQRCodeUrl, fetchEventQRCode } from '@/lib/qr-code'

interface QRCodeDisplayProps {
  eventId: string
  url?: string // Allow direct URL passing to support both approaches
  eventName?: string
  type?: 'event' | 'gallery' | 'check-in'
  title?: string
  description?: string
  size?: number
}

export function QRCodeDisplay({
  eventId,
  url,
  eventName,
  type = 'event',
  title = eventName ? `${eventName} QR Code` : 'Event QR Code',
  description = 'Scan this code to access the event gallery',
  size = 300
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(url || '')
  const [isLoading, setIsLoading] = useState(!url)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if viewport is mobile size
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobileView();
    
    // Listen for resize
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);
  
  // Generate QR code on mount if no URL is provided
  useEffect(() => {
    if (!url) {
      generateQRCode()
    }
  }, [eventId, type, url])
  
  // Generate QR code
  const generateQRCode = async () => {
    setIsLoading(true)
    
    try {
      // If a URL was directly provided, use it
      if (url) {
        setQrCodeUrl(url)
        return
      }
      
      // Otherwise generate the QR code using our client-safe utility
      // First try using the API endpoint
      const fetchedUrl = await fetchEventQRCode(eventId)
      setQrCodeUrl(fetchedUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      
      // Fallback to direct generation
      const generatedUrl = generateQRCodeUrl({
        event_id: eventId,
        type: type
      })
      setQrCodeUrl(generatedUrl)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Regenerate QR code
  const handleRegenerate = () => {
    setIsGenerating(true)
    generateQRCode().finally(() => {
      setIsGenerating(false)
    })
  }
  
  // Download QR code
  const handleDownload = async () => {
    try {
      if (!qrCodeUrl) return
      
      // Create a download link
      const downloadLink = document.createElement('a')
      downloadLink.href = qrCodeUrl
      downloadLink.download = `${type}-qr-code-${eventId}.png`
      
      // Trigger download
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }
  
  // Share QR code
  const handleShare = async () => {
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        // Share the URL
        await navigator.share({
          title: title,
          text: description,
          url: qrCodeUrl
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(qrCodeUrl)
        alert('QR code URL copied to clipboard')
      }
    } catch (error) {
      console.error('Error sharing QR code:', error)
    }
  }
  
  const qrCodeSize = isMobile ? 150 : size;
  
  return (
    <Card style={{ 
      width: '100%', 
      maxWidth: '400px', 
      margin: '0 auto',
      border: '2px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <CardHeader style={{ 
        padding: '16px',
        borderBottom: '2px solid var(--border)'
      }}>
        <CardTitle style={{ 
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '4px'
        }}>{title}</CardTitle>
        <p style={{ 
          fontSize: '14px',
          color: 'var(--muted-foreground)'
        }}>{description}</p>
      </CardHeader>
      
      <CardContent style={{ 
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--background)'
      }}>
        {isLoading ? (
          <Skeleton style={{ 
            width: `${qrCodeSize}px`, 
            height: `${qrCodeSize}px`,
            borderRadius: '8px'
          }} />
        ) : (
          <div style={{ 
            width: `${qrCodeSize}px`,
            height: `${qrCodeSize}px`,
            position: 'relative',
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid #e0e0e0'
          }}>
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              fill
              style={{ 
                objectFit: 'contain'
              }}
              priority
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter style={{ 
        padding: '12px 16px',
        borderTop: '2px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        flexWrap: 'wrap',
        backgroundColor: 'var(--card)'
      }}>
        <Button
          variant="outline"
          size="sm"
          style={{ 
            height: '36px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease'
          }}
          onClick={handleRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw style={{ height: '14px', width: '14px' }} />
          <span>{isMobile ? '' : 'Regenerate'}</span>
        </Button>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px'
        }}>
          <Button
            variant="outline"
            size="sm"
            style={{ 
              height: '36px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease'
            }}
            onClick={handleDownload}
            disabled={isLoading || !qrCodeUrl}
          >
            <Download style={{ height: '14px', width: '14px' }} />
            <span>{isMobile ? '' : 'Download'}</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            style={{ 
              height: '36px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onClick={handleShare}
            disabled={isLoading || !qrCodeUrl}
          >
            <Share2 style={{ height: '14px', width: '14px' }} />
            <span>{isMobile ? '' : 'Share'}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 