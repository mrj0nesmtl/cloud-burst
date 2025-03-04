import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight } from "lucide-react"
import Link from "next/link"
import { DebugInfo } from "@/components/debug-info"
import { Metadata } from 'next'
import Image from "next/image"

export const metadata: Metadata = {
  title: 'Cloud Burst - Elevate Your Event Photography',
  description: 'Capture, enhance, and share event photos with AI-powered technology. Perfect for weddings, corporate events, and celebrations.',
  openGraph: {
    title: 'Cloud Burst - Elevate Your Event Photography',
    description: 'AI-powered event photography platform for seamless photo sharing and management.'
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Debug Component */}
      <DebugInfo />
      
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CloudLightning className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-3 md:mb-4">
            Elevate Your Event Photography
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-[700px] mx-auto mb-5 md:mb-6">
            AI-powered platform for seamless photo capture, enhancement, and sharing.
            Perfect for weddings, corporate events, and celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild size="lg" className="text-base min-w-[180px]">
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base min-w-[180px]">
              <Link href="/marketing/pricing">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Simple Features Section */}
      <section className="py-12 bg-muted/50 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Why Choose Cloud Burst?
          </h2>
          <p className="max-w-[600px] mx-auto">
            Experience the future of event photography with our innovative platform.
          </p>
        </div>
      </section>
    </div>
  )
}
