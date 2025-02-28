import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight, Brain, Shield, Share2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next'

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
      <div className="relative min-h-[80vh] flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="object-cover w-full h-full opacity-[0.9]"
            poster="/images/fallback-hero.jpg"
          >
            <source src="/hero_bg.mp4" type="video/mp4" />
            <img 
              src="/images/fallback-hero.jpg" 
              alt="Event Photography" 
              className="object-cover w-full h-full"
            />
          </video>
        </div>
        
        {/* Remove or comment out the old background image */}
        {/* <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/pexels-themo1-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: '0.15'
          }}
        /> */}
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background z-0" />
        
        <div className="relative z-10 container mx-auto px-4 py-32 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <CloudLightning className="h-16 w-16 text-blue-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Elevate Your Event Photography
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mx-auto mb-8">
            AI-powered platform for seamless photo capture, enhancement, and sharing.
            Perfect for weddings, corporate events, and celebrations.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Brain className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">AI-Powered</h3>
              <p className="text-muted-foreground">
                Smart curation and enhancement of your event photos.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Shield className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Secure Sharing</h3>
              <p className="text-muted-foreground">
                Private, controlled access to your event galleries.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Share2 className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Instant Access</h3>
              <p className="text-muted-foreground">
                No app needed—just scan and capture moments.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Sparkles className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Auto-Enhancement</h3>
              <p className="text-muted-foreground">
                Professional-looking photos with AI magic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start?
          </h2>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8">
            Join photographers who trust Cloud Burst.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/auth/signin">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
