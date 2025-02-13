import { 
  Rocket, 
  Brain, 
  Share2, 
  Shield, 
  CloudLightning,
  Users 
} from "lucide-react"

export const metadata = {
  title: 'About | Cloud Capture',
  description: 'Learn about Cloud Capture - AI-powered event photography platform',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-4">
      <div className="bg-background/80 rounded-lg p-8 shadow-lg space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter">About Cloud Capture</h1>
          <p className="text-xl text-muted-foreground">
            Revolutionizing event photography by blending nostalgia with modern technology.
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Vision</h2>
            <p className="text-muted-foreground">
              Inspired by the nostalgia of disposable cameras on event tables, Cloud Capture 
              modernizes the experience using guests' smartphones and a seamless cloud-based 
              infrastructure. We're transforming event photography for a digital-first audience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Frictionless Access</h3>
                <p className="text-sm text-muted-foreground">
                  No app download required—guests scan & capture moments instantly via QR code.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">AI-Powered Curation</h3>
                <p className="text-sm text-muted-foreground">
                  Smart filters remove duplicates & categorize photos using facial recognition & timestamps.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Seamless Collection</h3>
                <p className="text-sm text-muted-foreground">
                  All images are automatically uploaded to a centralized event gallery.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Privacy Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Event hosts can moderate content & set permissions for sharing.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Perfect For</h2>
            <ul className="grid gap-2 text-muted-foreground">
              <li>• Wedding Planners & Celebrations</li>
              <li>• Corporate Events & Conferences</li>
              <li>• Music Festivals & Entertainment</li>
              <li>• Brand Activations & Launch Events</li>
              <li>• Private Celebrations & Gatherings</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Why Choose Cloud Capture?</h2>
            <p className="text-muted-foreground">
              Unlike traditional solutions that rely on expensive photographers or 
              disorganized social media hashtags, Cloud Capture provides a private, 
              AI-powered ecosystem that ensures high-quality photos while being more 
              cost-effective than traditional photography solutions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 