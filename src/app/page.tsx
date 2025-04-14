import { Button } from "@/components/ui/button"
import { CloudLightning, ArrowRight, CameraIcon, Share2, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next'
import Image from "next/image"
import "@/styles/layout.css"

export const metadata: Metadata = {
  title: 'Cloud Burst - Capture Every Moment',
  description: 'Capture, enhance, and share event memories with AI-powered technology. Perfect for weddings, corporate events, and celebrations.',
  openGraph: {
    title: 'Cloud Burst - Capture Every Moment',
    description: 'Crowd-powered event media platform for seamless photo sharing and engagement.'
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Pattern - Just use one simple pattern */}
      <div className="hexagon-pattern opacity-15"></div>
      
      {/* Hero Section with Video Background */}
      <section className="hero-section relative overflow-hidden" style={{ minHeight: '60vh', maxHeight: '800px' }}>
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
            poster="/images/pexels-themo1-bg.jpg"
          >
            <source src="/hero_bg2.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="hero-logo mb-6">
            <CloudLightning className="h-16 w-16 text-primary" />
          </div>
          <h1 className="hero-title text-center mb-4">
            Capture Every Moment
          </h1>
          <p className="hero-subtitle text-gray-100 text-center max-w-2xl mb-8">
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
      <section className="section bg-background py-10">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-6">How memories will be captured.</h2>
          <p className="text-center max-w-3xl mx-auto mb-12 text-muted-foreground">
            Experience the future of event media capture.
          </p>
          
          <div className="card-grid md-grid-cols-2 lg-grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <CameraIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="feature-title text-center">Crowd Capture</h3>
              <p className="feature-description text-center">
                Seamlessly capture moments with our intuitive interface and crowd-powered tools.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <Sparkles className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="feature-title text-center">Auto-Enhance</h3>
              <p className="feature-description text-center">
                Automatically enhance and stitch media with our advanced algorithms for perfect clips.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <Share2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="feature-title text-center">Easy Sharing</h3>
              <p className="feature-description text-center">
                Share your event memories instantly with guests and friends through our engagement platform.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="feature-title text-center">Collaborative</h3>
              <p className="feature-description text-center">
                Allow professional photographers to contribute their photos to capture the full essence of the event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section - No bottom border */}
      <section className="container mx-auto px-4 flex-grow">
        <div className="cta-section bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-8 space-y-6 border border-primary/20 shadow-lg">
          <h2 className="text-3xl font-bold text-primary text-center">Register for Cloud Burst Beta</h2>
          <p className="text-lg text-center text-foreground">
            April 2025
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="btn-primary" asChild>
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-background hover:bg-muted" asChild>
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
