import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight, CameraIcon, Share2, Users, Sparkles } from "lucide-react"
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
      {/* Background Pattern - Just use one simple pattern */}
      <div className="hexagon-pattern"></div>
      
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CloudLightning className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Elevate Your Event Photography
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-[700px] mx-auto mb-8 md:mb-10">
            AI-powered platform for seamless photo capture, enhancement, and sharing.
            Perfect for weddings, corporate events, and celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base min-w-[180px] btn-primary shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base min-w-[180px] bg-background/80 backdrop-blur hover:bg-background/60 transition-all">
              <Link href="/marketing/pricing">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              Why Choose Cloud Burst?
            </h2>
            <p className="text-lg max-w-[700px] mx-auto text-muted-foreground">
              Experience the future of event photography with our innovative platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center group">
              <div className="flex justify-center mb-4">
                <CameraIcon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Effortless Capture</h3>
              <p className="text-muted-foreground">No app downloads required. Just scan, capture, and share instantly.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center group">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
              <p className="text-muted-foreground">Smart filters and automatic improvements for professional-quality photos.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center group">
              <div className="flex justify-center mb-4">
                <Share2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Sharing</h3>
              <p className="text-muted-foreground">Centralized galleries for easy access, downloading and sharing with guests.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center group">
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy Controls</h3>
              <p className="text-muted-foreground">Full control over who can view, share, and download your event photos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
