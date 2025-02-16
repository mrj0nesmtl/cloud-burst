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
  title: 'About | Cloud Capture',
  description: 'Learn about Cloud Capture - AI-powered event photography platform',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="relative bg-muted/50 py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <CloudLightning className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
              About Cloud Capture
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing event photography by blending nostalgia with modern technology.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-16 px-4 space-y-16">
        {/* Vision Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Our Vision</h2>
          <p className="text-lg text-muted-foreground">
            Inspired by the nostalgia of disposable cameras on event tables, Cloud Capture 
            modernizes the experience using guests' smartphones and a seamless cloud-based 
            infrastructure. We're transforming event photography for a digital-first audience.
          </p>
        </section>

        {/* How It Works Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <Brain className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Frictionless Access</h3>
              <p className="text-muted-foreground">
                No app download required—guests scan & capture moments instantly via QR code.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <Sparkles className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Curation</h3>
              <p className="text-muted-foreground">
                Smart filters remove duplicates & categorize photos using facial recognition & timestamps.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <Share2 className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seamless Collection</h3>
              <p className="text-muted-foreground">
                All images are automatically uploaded to a centralized event gallery.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <Shield className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Privacy Controls</h3>
              <p className="text-muted-foreground">
                Event hosts can moderate content & set permissions for sharing.
              </p>
            </div>
          </div>
        </section>

        {/* Perfect For Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Perfect For</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card rounded-lg p-6 shadow-sm border hover:border-blue-500 transition-colors">
              <PartyPopper className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Wedding Planners & Celebrations</h3>
              <p className="text-sm text-muted-foreground">
                Capture every precious moment of the special day.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border hover:border-blue-500 transition-colors">
              <Building2 className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Corporate Events & Conferences</h3>
              <p className="text-sm text-muted-foreground">
                Professional documentation of business gatherings.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border hover:border-blue-500 transition-colors">
              <Music className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Music Festivals & Entertainment</h3>
              <p className="text-sm text-muted-foreground">
                Crowd-sourced memories from live events.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border hover:border-blue-500 transition-colors">
              <Rocket className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Brand Activations & Launches</h3>
              <p className="text-sm text-muted-foreground">
                Engage audiences and capture brand moments.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border hover:border-blue-500 transition-colors">
              <Users2 className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Private Celebrations</h3>
              <p className="text-sm text-muted-foreground">
                Personal gatherings and intimate events.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Why Choose Cloud Capture?</h2>
          <p className="text-lg text-muted-foreground">
            Unlike traditional solutions that rely on expensive photographers or 
            disorganized social media hashtags, Cloud Capture provides a private, 
            AI-powered ecosystem that ensures high-quality photos while being more 
            cost-effective than traditional photography solutions.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Your Events?</h2>
            <p className="text-lg text-muted-foreground">
              Join Cloud Capture today and experience the future of event photography.
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