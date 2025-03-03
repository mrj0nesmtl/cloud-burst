"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Share2, RefreshCw } from 'lucide-react'
import { generateQRCodeUrl, generateQRCodeDataUrl } from '@/lib/qr-code'
import { QRCodeParams } from '@/types/events'

interface QRCodeDisplayProps {
  eventId: string
  type: 'event' | 'attendee'
  attendeeId?: string
  title?: string
  description?: string
  size?: number
}

export function QRCodeDisplay({
  eventId,
  type,
  attendeeId,
  title = 'Event QR Code',
  description = 'Scan this code to access the event gallery',
  size = 300
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Generate QR code on mount
  useEffect(() => {
    generateQRCode()
  }, [eventId, type, attendeeId, size])
  
  // Generate QR code
  const generateQRCode = async () => {
    setIsLoading(true)
    
    try {
      const params: QRCodeParams = {
        event_id: eventId,
        type,
        attendee_id: attendeeId,
        size
      }
      
      const url = generateQRCodeUrl(params)
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
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
      const params: QRCodeParams = {
        event_id: eventId,
        type,
        attendee_id: attendeeId,
        size
      }
      
      const dataUrl = await generateQRCodeDataUrl(params)
      
      // Create a download link
      const downloadLink = document.createElement('a')
      downloadLink.href = dataUrl
      downloadLink.download = `${type}-qr-code-${eventId}${attendeeId ? `-${attendeeId}` : ''}.png`
      
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
      // Get the data URL for sharing
      const params: QRCodeParams = {
        event_id: eventId,
        type,
        attendee_id: attendeeId,
        size
      }
      
      const dataUrl = await generateQRCodeDataUrl(params)
      
      // Check if Web Share API is available
      if (navigator.share) {
        // Convert data URL to blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        
        // Create file from blob
        const file = new File([blob], `${type}-qr-code.png`, { type: 'image/png' })
        
        // Share the file
        await navigator.share({
          title: title,
          text: description,
          files: [file]
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard')
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
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleShare}
            disabled={isLoading}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 