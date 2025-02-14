import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Capture - Transform Your Event Photography',
  description: 'Capture, enhance, and share event photos with AI-powered technology. Perfect for weddings, corporate events, and celebrations.',
  openGraph: {
    title: 'Cloud Capture - Transform Your Event Photography',
    description: 'AI-powered event photography platform for seamless photo sharing and management.'
  }
}

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/pexels-themo1-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: '0.25'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-[calc(100vh-8rem)] p-8 pb-20 gap-16 sm:p-20">
          <main className="flex flex-col gap-8 items-center sm:items-start">
            <div className="flex items-center gap-2">
              <CloudLightning className="h-12 w-12 text-blue-500" />
              <h1 className="text-4xl font-bold tracking-tighter">Cloud Capture</h1>
            </div>

            <p className="text-xl text-muted-foreground max-w-[600px] text-center sm:text-left">
              AI-powered event photography platform for seamless photo sharing and management.
            </p>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Button asChild size="lg">
                <Link href="/marketing">
                  Explore Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/marketing/about">Learn More</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
