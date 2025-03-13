import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'QR Codes | Cloud Burst',
  description: 'Manage QR codes for your events',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function QRCodesPage() {
  // Mock data for QR code
  const mockEvent = {
    id: '01',
    name: 'Test Event 01',
    date: '3/14/2025',
    qr_code_url: '/placeholder-qr.png',
    custom_url: 'https://cloudburst.app/e/test01',
    status: 'active'
  };
  
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>QR Codes</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Generate and manage QR codes for your events
        </p>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ padding: '8px 16px', borderBottom: '2px solid var(--primary)', fontWeight: 'medium' }}>
            Active Events (1)
          </div>
          <div style={{ padding: '8px 16px', color: 'var(--muted-foreground)' }}>
            Archived Events (0)
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <Card>
            <CardHeader>
              <CardTitle>{mockEvent.name}</CardTitle>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>{mockEvent.date}</p>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', background: 'white' }}>
                  <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                    <Image 
                      src="/placeholder-qr.png" 
                      alt={`QR Code for ${mockEvent.name}`}
                      width={150}
                      height={150}
                    />
                  </div>
                </div>
                
                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="mr-2 h-4 w-4" /> View
                  </Button>
                </div>
                
                <div style={{ fontSize: '14px', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                  <p>Scan this code to access the event gallery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>About QR Codes</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> Event QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                QR codes allow attendees to easily access your event gallery. Place these codes at your event venue for easy access.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> Attendee QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Each attendee receives a unique QR code for check-in and photo tagging. These codes help organize photos by attendee.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 