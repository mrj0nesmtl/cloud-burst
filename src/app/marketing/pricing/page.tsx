import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Package, 
  Star, 
  Zap,
  CheckCircle2,
  Crown 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const metadata = {
  title: 'Pricing | Cloud Capture',
  description: 'Simple, transparent pricing for events of any size',
}

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small gatherings",
    icon: <Package className="h-8 w-8 text-blue-500 mb-4" />,
    features: [
      "Up to 100 photos",
      "Basic AI organization",
      "24-hour access",
      "Standard support",
    ],
  },
  {
    name: "Professional",
    price: "$199",
    description: "Perfect for larger events and professional gatherings",
    icon: <Crown className="h-8 w-8 text-purple-500 mb-4" />,
    features: [
      "All Standard features",
      "Unlimited photos",
      "Priority support",
      "Custom branding",
      "Advanced analytics",
      "AI photo enhancement",
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold tracking-tighter mb-8">Pricing</h1>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold tracking-tighter">Simple, Transparent Pricing</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your event
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="p-6">
              <div className="text-center mb-6">
                {plan.icon}
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <div className="text-4xl font-bold my-4">{plan.price}</div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">
                {plan.name === "Starter" ? (
                  <Star className="mr-2 h-4 w-4" />
                ) : (
                  <Crown className="mr-2 h-4 w-4" />
                )}
                {plan.name === "Starter" ? "Get Started" : "Contact Sales"}
              </Button>
            </Card>
          ))}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Contact Sales Team</DialogTitle>
              <DialogDescription>
                Tell us about your event needs and we'll help you find the perfect solution.
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-6 py-4">
              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label>I am a(n):</Label>
                <RadioGroup defaultValue="individual" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Company</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required placeholder="your@email.com" />
                </div>
              </div>

              {/* Company Details (Optional) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name (Optional)</Label>
                  <Input id="company-name" placeholder="Your company" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weddings">Weddings & Celebrations</SelectItem>
                      <SelectItem value="corporate">Corporate Events</SelectItem>
                      <SelectItem value="entertainment">Entertainment & Festivals</SelectItem>
                      <SelectItem value="education">Education & Conferences</SelectItem>
                      <SelectItem value="sports">Sports & Recreation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Event Details (Optional) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="event-size">Average Event Size (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (Up to 50 people)</SelectItem>
                      <SelectItem value="medium">Medium (51-150 people)</SelectItem>
                      <SelectItem value="large">Large (151-500 people)</SelectItem>
                      <SelectItem value="xlarge">Extra Large (500+ people)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="events-per-year">Events per Year (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 events</SelectItem>
                      <SelectItem value="3-5">3-5 events</SelectItem>
                      <SelectItem value="6-12">6-12 events</SelectItem>
                      <SelectItem value="12+">12+ events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="grid gap-2">
                <Label htmlFor="message">Additional Details (Optional)</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your specific needs, event types, or any questions you have."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button type="submit">Send Message</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 