import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scan QR Code - Cloud Burst',
  description: 'Scan event QR code to access the gallery and capture media',
}

export default function QRScanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
} 