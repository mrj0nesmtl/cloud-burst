'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Share2, Link2, Mail } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Invitation } from '@/types/invitations'
import { Skeleton } from '@/components/ui/skeleton'

interface EventInvitationQRProps {
  invitation: Invitation
  eventName: string
  baseUrl?: string
}

export function EventInvitationQR({ invitation, eventName, baseUrl = 'https://app.cloudburst.io' }: EventInvitationQRProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('qr')
  const [isClient, setIsClient] = useState(false)
  
  // Create invitation URLs
  const inviteUrl = `${baseUrl}/invite/${invitation.token}`
  const magicLinkUrl = invitation.metadata?.magic_link || inviteUrl
  
  // Set isClient to true when component mounts (to prevent hydration issues with QR code)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Handle copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast({
        title: 'Link copied',
        description: 'Invitation link copied to clipboard',
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the invitation link',
        variant: 'destructive',
      })
    }
  }
  
  // Handle direct share (if available)
  const shareInvitation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitation to ${eventName}`,
          text: `You've been invited to ${eventName}. Tap the link to access the event.`,
          url: inviteUrl,
        })
        toast({
          title: 'Shared successfully',
          description: 'Invitation has been shared',
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({
            title: 'Share failed',
            description: 'Could not share the invitation',
            variant: 'destructive',
          })
        }
      }
    } else {
      copyToClipboard(inviteUrl)
    }
  }
  
  // Handle email share
  const emailInvitation = () => {
    const subject = encodeURIComponent(`Invitation to ${eventName}`)
    const body = encodeURIComponent(`You've been invited to ${eventName}. Click here to access the event: ${inviteUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }
  
  // Handle download QR code
  const downloadQRCode = () => {
    const svg = document.getElementById('invitation-qr')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      // Download PNG
      const downloadLink = document.createElement('a')
      downloadLink.download = `${eventName.replace(/\s+/g, '-')}-invitation.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Invitation QR Code</CardTitle>
        <CardDescription>
          Scan this QR code to access {eventName}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="qr" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="qr" className="m-0">
            {isClient ? (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    id="invitation-qr"
                    value={inviteUrl}
                    size={200}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: '/logo-mark.png',
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Skeleton className="h-[230px] w-[230px]" />
              </div>
            )}
            
            <div className="text-center mt-4 text-sm text-muted-foreground">
              For invited guest: <span className="font-medium">{invitation.name || invitation.email}</span>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="m-0 space-y-4">
            <div className="p-4 bg-muted rounded-md break-all">
              <div className="text-sm font-medium mb-1">Invitation Link:</div>
              <div className="text-sm text-muted-foreground">{inviteUrl}</div>
            </div>
            
            {invitation.metadata?.magic_link && (
              <div className="p-4 bg-muted rounded-md break-all">
                <div className="text-sm font-medium mb-1">Magic Link (one-time use):</div>
                <div className="text-sm text-muted-foreground">{invitation.metadata.magic_link}</div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                For: <span className="font-medium">{invitation.name || invitation.email}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Status: <span className="font-medium capitalize">{invitation.status}</span>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex gap-2 pt-0">
        {activeTab === 'qr' ? (
          <>
            <Button variant="outline" size="sm" className="flex-1" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={shareInvitation}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => copyToClipboard(inviteUrl)}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={emailInvitation}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
} 