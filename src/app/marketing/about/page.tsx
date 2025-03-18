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
  Users2,
  Camera,
  QrCode,
  Lock,
  Share,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import "@/styles/layout.css"

export const metadata = {
  title: 'About | Cloud Burst',
  description: 'Learn about Cloud Burst - Crowd-powered event photography platform',
}

// Helper function to format the modal descriptions
const formatDescription = (text: string) => {
  if (text.includes('Benefits:') || text.includes('Key Benefits:') || text.includes('Features:') || text.includes('Advantages:')) {
    const parts = text.split(/Benefits:|Key Benefits:|Features:|Advantages:/);
    const intro = parts[0].trim();
    const benefitsSection = parts[1]?.trim() || '';
    
    let sectionType = text.match(/(Benefits|Key Benefits|Features|Advantages):/)?.[1] || "Benefits";
    const bulletPoints = benefitsSection.split('•').filter(item => item.trim().length > 0).map(item => item.trim());
    
    return (
      <div className="space-y-6">
        <DialogDescription>
          {intro}
        </DialogDescription>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-primary">{sectionType}</h4>
          <ul className="space-y-3">
            {bulletPoints.map((point: string, i: number) => (
              <li key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  return <DialogDescription>{text}</DialogDescription>;
};

const howItWorksCards = [
  {
    icon: <QrCode className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Frictionless Access",
    description: "No app download required—guests scan & capture moments instantly via QR code.",
    modalContent: {
      title: "Seamless Event Access",
      description: `Cloud Burst revolutionizes event photography with our QR-driven access system. Guests simply scan a QR code from their invitation or event signage to instantly join the event's private photo gallery. No apps to download, no accounts to create—just point, scan, and start capturing memories.

      Key Benefits:
      • Instant gallery access
      • Zero technical setup
      • Works on any smartphone
      • Real-time photo sharing
      • Automatic gallery organization`
    }
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "AI-Powered Curation",
    description: "Smart filters remove duplicates & categorize photos using facial recognition & timestamps.",
    modalContent: {
      title: "AI-Enhanced Photo Management",
      description: `Our advanced AI technology transforms event photography by automatically curating and enhancing your photos in real-time.

      Features:
      • Automatic quality assessment
      • Smart duplicate detection
      • Facial recognition grouping
      • Timeline organization
      • Auto-enhancement of lighting and color
      • Blur detection and removal
      • Smart categorization by moment type`
    }
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Seamless Collection",
    description: "All images are automatically uploaded to a centralized event gallery.",
    modalContent: {
      title: "Centralized Photo Management",
      description: `Cloud Burst creates a unified hub for all your event photos, making collection and sharing effortless.

      Benefits:
      • Real-time photo syncing
      • Automatic background uploads
      • Multi-device compatibility
      • Instant gallery updates
      • Easy sharing options
      • Organized collections
      • Download in various formats`
    }
  },
  {
    icon: <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Privacy Controls",
    description: "Event hosts can moderate content & set permissions for sharing.",
    modalContent: {
      title: "Advanced Privacy Protection",
      description: `Take full control of your event's photo privacy with our comprehensive security features.

      Security Features:
      • Custom access controls
      • Content moderation tools
      • Selective sharing permissions
      • GDPR compliance
      • End-to-end encryption
      • Watermarking options
      • Deletion controls`
    }
  }
]

const perfectForCards = [
  {
    icon: <PartyPopper className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Wedding Planners & Celebrations",
    description: "Capture every precious moment of the special day.",
    modalContent: {
      title: "Wedding & Celebration Photography",
      description: `Perfect for capturing the magic of weddings and special celebrations. Our platform ensures no moment goes unmissed.

      Benefits:
      • Complete event coverage
      • Guest participation
      • Real-time sharing
      • Professional-quality results
      • Organized collections
      • Custom branding options
      • Memory preservation`
    }
  },
  {
    icon: <Building2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Corporate Events & Conferences",
    description: "Professional documentation of business gatherings.",
    modalContent: {
      title: "Corporate Event Solutions",
      description: `Elevate your corporate events with professional-grade photo management and sharing capabilities.

      Features:
      • Branded galleries
      • Professional filtering
      • Team collaboration
      • Event analytics
      • Corporate compliance
      • Easy distribution
      • Marketing integration`
    }
  },
  {
    icon: <Music className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Music Festivals & Entertainment",
    description: "Crowd-sourced memories from live events.",
    modalContent: {
      title: "Festival & Entertainment Photography",
      description: `Perfect for large-scale entertainment events where multiple perspectives create a rich visual story.

      Advantages:
      • Mass participation
      • Real-time content
      • Artist integration
      • Fan engagement
      • Social sharing
      • Moment curation
      • Experience amplification`
    }
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Brand Activations & Launches",
    description: "Engage audiences and capture brand moments.",
    modalContent: {
      title: "Brand Event Solutions",
      description: `Maximize the impact of your brand events with comprehensive photo coverage and sharing capabilities.

      Features:
      • Brand consistency
      • Engagement tracking
      • Content moderation
      • Social integration
      • Analytics dashboard
      • Marketing assets
      • ROI measurement`
    }
  },
  {
    icon: <Users2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Private Celebrations",
    description: "Personal gatherings and intimate events.",
    modalContent: {
      title: "Private Event Photography",
      description: `Perfect for intimate gatherings where personal memories matter most.

      Benefits:
      • Private sharing
      • Family collections
      • Easy organization
      • Selective access
      • Memory preservation
      • Custom albums
      • Instant sharing`
    }
  },
  {
    icon: <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />,
    title: "Photography Studios",
    description: "Enhanced workflow for professional photographers.",
    modalContent: {
      title: "Professional Photography Integration",
      description: `Streamline your photography business with our professional-grade tools and features.

      Advantages:
      • Client galleries
      • Workflow automation
      • AI enhancement
      • Business analytics
      • Client collaboration
      • Professional editing
      • Portfolio showcase`
    }
  }
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden" style={{ minHeight: '60vh', maxHeight: '800px' }}>
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
            <source src="/hero_bg.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="hexagon-pattern opacity-15"></div>
        <div className="container mx-auto relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="hero-logo mb-6">
            <CloudLightning className="h-12 w-12 text-primary" />
          </div>
          <h1 className="hero-title text-white text-center mb-4">
            What is Cloud Burst?
          </h1>
          <p className="hero-subtitle text-gray-100 text-center max-w-2xl">
            Blending nostalgia with modern technology.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* How It Works Section */}
        <section className="section py-16">
          <h2 className="section-title text-center mb-6">How It Works</h2>
          <p className="section-subtitle text-center max-w-3xl mx-auto mb-12">
            No apps to download, no accounts to create. Just scan a QR code and start capturing memories. It's that simple.
            Cloud Burst revolutionizes event media capture by bringing the charm of disposable cameras into the modern age. Our 
            platform transforms every event into a collaborative media story, powered by AI and created by all attendees. With 
            no apps to download and no accounts to create, guests simply scan a QR code to instantly start capturing and sharing 
            photos and videos.
          </p>
          
          <div className="card-grid md-grid-cols-2 lg-grid-cols-2">
            {howItWorksCards.map((card, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="feature-card cursor-pointer">
                    <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                      {card.icon}
                    </div>
                    <h3 className="feature-title">{card.title}</h3>
                    <p className="feature-description">{card.description}</p>
                    <div className="mt-4 text-primary text-sm flex items-center opacity-80 hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 p-2.5 rounded-md">
                          {card.icon}
                        </span>
                        <span>{card.modalContent.title}</span>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  {formatDescription(card.modalContent.description)}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </section>

        {/* Perfect For Section */}
        <section className="section py-0">
          <h2 className="section-title">Perfect For</h2>
          <p className="section-subtitle">
            Cloud Burst enhances photography across a wide range of events and industries.
          </p>
          
          <div className="card-grid sm-grid-cols-2 lg-grid-cols-3">
            {perfectForCards.map((card, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="feature-card cursor-pointer">
                    <div className="feature-icon group flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                      {card.icon}
                    </div>
                    <h3 className="feature-title">{card.title}</h3>
                    <p className="feature-description">{card.description}</p>
                    <div className="mt-4 text-primary text-sm flex items-center opacity-80 hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 p-2.5 rounded-md">
                          {card.icon}
                        </span>
                        <span>{card.modalContent.title}</span>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  {formatDescription(card.modalContent.description)}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </section>

        {/* Why Choose Section - Enhanced with Vision content */}
        <section className="section py-0">
          <h2 className="section-title">Why Choose Cloud Burst?</h2>
          <p className="section-subtitle">
            Inspired by the nostalgia of disposable cameras on event tables, Cloud Burst 
            modernizes the experience using guests' smartphones and a seamless cloud-based 
            infrastructure. Unlike traditional solutions that rely on expensive photographers or 
            disorganized social media hashtags, we provide a private, AI-powered ecosystem 
            that ensures high-quality photos while being more cost-effective than conventional approaches.
            We're transforming event photography for a digital-first audience who values both quality and convenience.
          </p>
        </section>

        {/* Join Us Section */}
        <section className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-8 space-y-6 border border-primary/20 shadow-lg mb-24">
          <h2 className="text-3xl font-bold text-primary text-center">Join Us Today</h2>
          <p className="text-lg text-center">
            Ready to transform your event photography experience?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="btn-primary" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-background hover:bg-muted" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-auto">
        <div className="container mx-auto py-16 px-4">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  )
} 