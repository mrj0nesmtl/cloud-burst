import { 
  Rocket, 
  Brain, 
  Share2, 
  Shield, 
  CloudLightning,
  Users,
  ArrowRight,
  Building2,
  PartyPopper,
  Music,
  Sparkles,
  Users2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: 'About | Cloud Burst',
  description: 'Learn about Cloud Burst - Crowd-powered event photography platform',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="relative bg-muted/0 py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <CloudLightning className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
              What is Cloud Burst?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elevating event photography by blending nostalgia with modern technology.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-16 px-4 space-y-16">
        {/* Vision Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">The Vision</h2>
          <p className="text-lg text-muted-foreground">
            Inspired by the nostalgia of disposable cameras on event tables, Cloud Burst 
            modernizes the experience using guests' smartphones and a seamless cloud-based 
            infrastructure. We're transforming event photography for a digital-first audience.
          </p>
        </section>

        {/* How It Works Section - Enhanced hover effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Brain className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Frictionless Access</h3>
              <p className="text-muted-foreground">
                No app download required—guests scan & capture moments instantly via QR code.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Sparkles className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">AI-Powered Curation</h3>
              <p className="text-muted-foreground">
                Smart filters remove duplicates & categorize photos using facial recognition & timestamps.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Share2 className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Seamless Collection</h3>
              <p className="text-muted-foreground">
                All images are automatically uploaded to a centralized event gallery.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Shield className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">Privacy Controls</h3>
              <p className="text-muted-foreground">
                Event hosts can moderate content & set permissions for sharing.
              </p>
            </div>
          </div>
        </section>

        {/* Perfect For Section - Enhanced hover effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Perfect For</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <PartyPopper className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">Wedding Planners & Celebrations</h3>
              <p className="text-sm text-muted-foreground">
                Capture every precious moment of the special day.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Building2 className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">Corporate Events & Conferences</h3>
              <p className="text-sm text-muted-foreground">
                Professional documentation of business gatherings.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Music className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">Music Festivals & Entertainment</h3>
              <p className="text-sm text-muted-foreground">
                Crowd-sourced memories from live events.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Rocket className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">Brand Activations & Launches</h3>
              <p className="text-sm text-muted-foreground">
                Engage audiences and capture brand moments.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Users2 className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">Private Celebrations</h3>
              <p className="text-sm text-muted-foreground">
                Personal gatherings and intimate events.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Why Choose Cloud Burst?</h2>
          <p className="text-lg text-muted-foreground">
            Unlike traditional solutions that rely on expensive photographers or 
            disorganized social media hashtags, Cloud Burst provides a private, 
            AI-powered ecosystem that ensures high-quality photos while being more 
            cost-effective than traditional photography solutions.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Your Events?</h2>
            <p className="text-lg text-muted-foreground">
              Join Cloud Burst today and experience the future of event photography.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/marketing/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 