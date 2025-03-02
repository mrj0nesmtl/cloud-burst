import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight, Brain, Shield, Share2, Sparkles } from "lucide-react"
import Link from "next/link"
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
      {/* Hero Section */}
      <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Background Image - Using absolute positioning for consistency */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pexels-themo1-bg.jpg"
            alt="Event Photography"
            fill
            className="object-cover opacity-[0.15]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-0" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CloudLightning className="h-10 w-10 md:h-12 md:w-12 text-blue-500" />
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

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-3">
              Why Choose Cloud Burst?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-[600px] mx-auto">
              Experience the future of event photography with our innovative platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg p-5 shadow-sm border group hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
              <Brain className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Smart curation and enhancement of your event photos.
              </p>
            </div>
            <div className="bg-card rounded-lg p-5 shadow-sm border group hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
              <Shield className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">Secure Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Private, controlled access to your event galleries.
              </p>
            </div>
            <div className="bg-card rounded-lg p-5 shadow-sm border group hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
              <Share2 className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">Instant Access</h3>
              <p className="text-sm text-muted-foreground">
                No app needed—just scan and capture moments.
              </p>
            </div>
            <div className="bg-card rounded-lg p-5 shadow-sm border group hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
              <Sparkles className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">Auto-Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Professional-looking photos with AI magic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-4">
            Ready to Transform Your Events?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[600px] mx-auto mb-6">
            Join photographers who trust Cloud Burst for their event photography needs.
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
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
