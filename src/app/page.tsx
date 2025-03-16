import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight, CameraIcon, Share2, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next'
import Image from "next/image"
import "@/styles/layout.css"

export const metadata: Metadata = {
  title: 'Cloud Burst - Capture Every Moment',
  description: 'Capture, enhance, and share event photos with AI-powered technology. Perfect for weddings, corporate events, and celebrations.',
  openGraph: {
    title: 'Cloud Burst - Capture Every Moment',
    description: 'AI-powered event photography platform for seamless photo sharing and management.'
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Pattern - Just use one simple pattern */}
      <div className="hexagon-pattern"></div>
      
      {/* Hero Section with Video Background */}
      <section className="hero-section relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
            poster="/hero-poster.jpg"
          >
            <source src="/hero_bg2.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto relative z-10">
          <div className="hero-logo">
            <CloudLightning className="h-20 w-20 text-primary" />
          </div>
          <h1 className="hero-title text-white">
            Capture Every Moment
          </h1>
          <p className="hero-subtitle text-gray-100">
            Crowd-powered platform for seamless media capture, enhancement, and sharing.
            Perfect for weddings, corporate events, and celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base min-w-[180px] btn-primary shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base min-w-[180px] bg-white/10 backdrop-blur hover:bg-white/20 text-white border-white/20 transition-all">
              <Link href="/marketing/about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Cloud Burst Section */}
      <section className="section bg-background">
        <div className="container mx-auto">
          <h2 className="section-title">Why Choose Cloud Burst?</h2>
          <p className="section-subtitle">
            Experience the future of event photography with our innovative platform.
          </p>
          
          <div className="card-grid md-grid-cols-2 lg-grid-cols-4">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                <CameraIcon className="h-10 w-10" />
              </div>
              <h3 className="feature-title">Instant Capture</h3>
              <p className="feature-description">
                Seamlessly capture moments with our intuitive interface and AI-powered tools.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles className="h-10 w-10" />
              </div>
              <h3 className="feature-title">AI Enhancement</h3>
              <p className="feature-description">
                Automatically enhance photos with our advanced AI algorithms for perfect results.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Share2 className="h-10 w-10" />
              </div>
              <h3 className="feature-title">Easy Sharing</h3>
              <p className="feature-description">
                Share your event photos instantly with guests through our cloud platform.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="feature-title">Collaborative</h3>
              <p className="feature-description">
                Allow guests to contribute their photos to create a comprehensive event gallery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-8 space-y-6 border border-primary/20 shadow-lg">
          <h2 className="text-3xl font-bold text-primary">Join Us Today</h2>
          <p className="text-lg">
            Cloud Burst is by Invitation Only.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="bg-background hover:bg-muted" asChild>
              <Link href="/marketing/about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
