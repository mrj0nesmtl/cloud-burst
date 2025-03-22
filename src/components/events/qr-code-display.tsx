"use client"

import { useState, useEffect } from 'react'
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
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="flex justify-center">
        {isLoading ? (
          <Skeleton className="w-[300px] h-[300px]" />
        ) : (
          <div className="relative w-[300px] h-[300px] bg-white p-4 rounded-lg">
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Regenerate</span>
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleDownload}
            disabled={isLoading || !qrCodeUrl}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleShare}
            disabled={isLoading || !qrCodeUrl}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 