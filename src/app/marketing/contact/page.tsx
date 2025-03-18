import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { 
  Mail, 
  MessageSquare, 
  Send,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  CloudLightning
} from "lucide-react"
import "@/styles/layout.css"

export const metadata = {
  title: 'Contact | Cloud Burst',
  description: 'Get in touch with the Cloud Burst team',
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-4" style={{ minHeight: '30vh' }}>
        <div className="hexagon-pattern opacity-15"></div>
        <div className="container-md mx-auto px-4">
          <div className="hero-logo mb-4">
            <CloudLightning className="h-12 w-12 text-primary" />
          </div>
          <h1 className="hero-title mb-4">
            Get in Touch
          </h1>
          <p className="hero-subtitle mb-6">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="section py-10">
        <div className="container-lg mx-auto px-4">
          <div className="card-grid md-grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-1 space-y-8">
              <Card className="p-6 hover:shadow-md transition-all">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="feature-icon">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-sm text-muted-foreground">support@arcanaconcept.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="feature-icon">
                      <Facebook className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook</h3>
                      <span className="text-sm text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="feature-icon">
                      <Instagram className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instagram</h3>
                      <span className="text-sm text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="feature-icon">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">BlueSky</h3>
                      <span className="text-sm text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="feature-icon">
                      <Linkedin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">LinkedIn</h3>
                      <span className="text-sm text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-8 md:col-span-2 hover:shadow-md transition-all">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base font-medium">First Name</label>
                    <Input 
                      placeholder="John" 
                      className="h-14 text-lg px-4 rounded-lg min-w-[240px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-medium">Last Name</label>
                    <Input 
                      placeholder="Doe" 
                      className="h-14 text-lg px-4 rounded-lg min-w-[240px]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-base font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    className="h-14 text-lg px-4 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium">Message</label>
                  <Textarea 
                    placeholder="How can we help you?"
                    className="min-h-[200px] text-lg p-4 rounded-lg resize-none"
                  />
                </div>

                <Button className="w-full h-14 text-lg" size="lg">
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 