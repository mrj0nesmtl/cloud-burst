import { GeistSans } from "geist/font/sans"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/ui/site-header"
import { SiteFooter } from "@/components/ui/site-footer"
import { ToastProvider } from "@/components/providers/toast-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toaster } from "@/components/ui/toaster"

const geist = GeistSans

// Suppress hydration warnings in production only
if (process.env.NODE_ENV === 'production') {
  const originalConsoleError = console.error
  console.error = (...args) => {
    // Suppress specific hydration warnings
    if (args[0]?.includes?.('Hydration failed')) return
    if (args[0]?.includes?.('Text content does not match')) return
    if (args[0]?.includes?.('Prop `style` did not match')) return
    originalConsoleError(...args)
  }
}

export const metadata = {
  title: 'Cloud Burst',
  description: 'Elevate Your Event Photography',
  applicationName: 'Cloud Burst',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <ToastProvider />
          </Suspense>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
