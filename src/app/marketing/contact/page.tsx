import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  Mail, 
  User, 
  MessageSquare, 
  Send,
  Phone,
  MapPin 
} from "lucide-react"

export const metadata = {
  title: 'Contact | Cloud Capture',
  description: 'Get in touch with the Cloud Capture team',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl py-16 px-4">
      <div className="bg-background/80 rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Contact Us</h1>
        <h2 className="text-2xl font-semibold text-blue-500 mb-4">Get in Touch</h2>
        <p className="text-muted-foreground mb-8">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>

        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <textarea
              id="message"
              placeholder="How can we help?"
              rows={6}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
} 