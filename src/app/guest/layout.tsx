import { Metadata } from 'next'
import { TokenProvider } from '@/contexts/token-context'

export const metadata: Metadata = {
  title: 'Guest Portal | Cloud Burst',
  description: 'Share and view photos from your events',
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className="flex flex-col min-h-screen"
      style={{
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: 'linear-gradient(to bottom, #0a0d14, #121620)'
      }}
    >
      <main 
        className="flex-1 relative"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <TokenProvider>
          {children}
        </TokenProvider>
      </main>
    </div>
  )
} 