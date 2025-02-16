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
} from "lucide-react"

export const metadata = {
  title: 'Contact | Cloud Burst',
  description: 'Get in touch with the Cloud Burst team',
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-muted/50 py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <MessageSquare className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl py-16 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1 space-y-8">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-sm text-muted-foreground">support@cloudburst.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Facebook</h3>
                    <a 
                      href="https://facebook.com/cloudburst" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      @cloudburst
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Instagram</h3>
                    <a 
                      href="https://instagram.com/cloudburst" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      @cloudburst
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">BlueSky</h3>
                    <a 
                      href="https://bsky.app/profile/cloudburst.bsky.social" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      @cloudburst
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Linkedin className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">LinkedIn</h3>
                    <a 
                      href="https://linkedin.com/company/cloudburst" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      Cloud Burst
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 md:col-span-2">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="How can we help you?"
                  className="min-h-[150px]"
                />
              </div>

              <Button className="w-full" size="lg">
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
} 