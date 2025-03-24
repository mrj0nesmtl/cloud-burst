'use client'

import { useParams } from 'next/navigation'
import { QRScanner } from '@/components/events/qr-scanner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function QRScanPage() {
  const params = useParams()
  const eventId = params.eventId as string
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link href={`/events/${eventId}/dashboard`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Event</span>
          </Button>
        </Link>
      </div>
      
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">
          Scan QR codes to authenticate guests or provide access to your event gallery
        </p>
      </div>
      
      <QRScanner eventId={eventId} />
      
      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">What can I scan?</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Invitation QR Codes - Validate and authenticate guests</li>
          <li>Magic Link QR Codes - Instant login for guests</li>
          <li>Gallery QR Codes - Direct access to event galleries</li>
        </ul>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <p className="font-medium">Scanning requires camera permissions</p>
          <p className="text-xs mt-1">
            If prompted, allow camera access to scan QR codes. This is only used for QR code scanning and not stored or transmitted elsewhere.
          </p>
        </div>
      </div>
    </div>
  )
} 