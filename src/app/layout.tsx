import { GeistSans } from "geist/font/sans"
import { Metadata, Viewport } from "next"
import { Suspense } from "react"
// Import CSS files in the correct order
import "./globals.css"
import "./components.css"
import "@/styles/layout.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/ui/site-header"
import { SiteFooter } from "@/components/ui/site-footer"
import QueryProvider from '@/components/providers/query-provider'
import { TooltipProvider } from '@/components/providers/tooltip-provider'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toaster as UIToaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Inter } from 'next/font/google'
import Script from 'next/script'

// Configure fonts
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                const storageKey = 'cloud-burst-theme';
                const theme = localStorage.getItem(storageKey);
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.classList.add(theme === 'system' ? systemTheme : theme || 'dark');
              } catch (e) {
                console.error('Error applying theme:', e);
                document.documentElement.classList.add('dark');
              }
            })();
          `}
        </Script>
      </head>
      <body className="font-sans antialiased max-w-full">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            storageKey="cloud-burst-theme"
          >
            <TooltipProvider>
              <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
                <SiteHeader />
                <main className="flex-1 w-full">
                  <Suspense fallback={
                    <div className="flex min-h-screen items-center justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    {children}
                  </Suspense>
                </main>
                <SiteFooter />
                <UIToaster />
                <SonnerToaster />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}