import { GeistSans } from "geist/font/sans"
import { Metadata, Viewport } from "next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/ui/site-header"
import { SiteFooter } from "@/components/ui/site-footer"
import { QueryProvider } from "@/components/providers/query-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toaster as UIToaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Inter } from 'next/font/google'

const geist = GeistSans
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Comprehensive hydration error suppression for production
if (process.env.NODE_ENV === 'production') {
  // Suppress console errors
  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    // Skip any hydration-related warnings
    if (typeof args[0] === 'string' && 
        (args[0].includes('Hydration') || 
         args[0].includes('content did not match') ||
         args[0].includes('Text content does not match') ||
         args[0].includes('Prop `style` did not match') ||
         args[0].includes('Extra attributes from the server') ||
         args[0].includes('Expected server HTML'))) {
      return
    }
    originalConsoleError(...args)
  }

  // Also suppress console warnings
  const originalConsoleWarn = console.warn
  console.warn = (...args: any[]) => {
    // Skip any hydration-related warnings
    if (typeof args[0] === 'string' && 
        (args[0].includes('Hydration') ||
         args[0].includes('content did not match'))) {
      return
    }
    originalConsoleWarn(...args)
  }
}

// Metadata
export const metadata: Metadata = {
  title: 'Cloud Burst',
  description: 'Elevate Your Event Photography',
  applicationName: 'Cloud Burst',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-beta.replit.app'),
}

// Viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <body className={`${geist.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="cloud-burst-theme"
          >
            {/* Simplified structure to prevent Suspense hydration issues */}
            <div className="flex flex-col min-h-screen relative">
              <SiteHeader />
              <main className="flex-1 relative z-10 flex flex-col">
                <Suspense fallback={
                  <div className="flex min-h-screen items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  {children}
                </Suspense>
              </main>
              <SiteFooter />
            </div>
            <UIToaster />
            <SonnerToaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}