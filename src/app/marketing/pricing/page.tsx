import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Package, 
  Star, 
  Zap,
  CheckCircle2,
  Crown,
  Building2,
  ArrowRight 
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"

export const metadata = {
  title: 'Pricing | Cloud Burst',
  description: 'Simple, transparent pricing for events of any size',
}

const plans = [
  {
    name: "Free Tier",
    price: "Free",
    description: "Perfect for trying out Cloud Burst",
    icon: <Package className="h-12 w-12 text-blue-500 group-hover:scale-110 transition-transform duration-300" />,
    features: [
      "Limited Features",
      "Up to 100 photos per event",
      "Basic AI organization",
      "24-hour access",
      "Standard support",
      "Social sharing",
      "Event gallery"
    ],
    popular: false,
  },
  {
    name: "Basic Plan",
    price: "$49",
    description: "Great for small to medium events",
    icon: <Star className="h-12 w-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />,
    features: [
      "Essential Features",
      "Up to 500 photos per event",
      "Advanced AI organization",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
      "Extended storage"
    ],
    popular: true,
  },
  {
    name: "Pro Plan",
    price: "$99",
    description: "Perfect for professional photographers",
    icon: <Crown className="h-12 w-12 text-purple-500 group-hover:scale-110 transition-transform duration-300" />,
    features: [
      "Advanced Features",
      "Unlimited photos",
      "Premium AI tools",
      "24/7 priority support",
      "White-label solution",
      "Advanced analytics",
      "API access"
    ],
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations & agencies",
    icon: <Building2 className="h-12 w-12 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />,
    features: [
      "Custom Solutions",
      "Unlimited everything",
      "Custom AI models",
      "Dedicated support",
      "Custom integration",
      "Advanced security",
      "SLA guarantee"
    ],
    popular: false,
  }
]

const faqs = [
  {
    question: "How secure is Cloud Burst?",
    answer: "Cloud Burst employs bank-grade encryption for all photos and data. We use enterprise-level security measures including end-to-end encryption, secure access controls, and regular security audits. All data is stored in compliance with GDPR and other privacy regulations."
  },
  {
    question: "How do event invitations work?",
    answer: "Event hosts receive a unique QR code that they can share with guests. Guests can scan this code to instantly access the event gallery and start contributing photos. No app downloads or account creation required. You can also manage guest access and permissions through your dashboard."
  },
  {
    question: "What privacy controls are available?",
    answer: "Event hosts have complete control over their galleries, including who can view and upload photos. You can set galleries as private or public, enable content moderation, and manage sharing permissions. Photos are never used for marketing without explicit consent."
  },
  {
    question: "Can photos be shared on social media?",
    answer: "Yes! Cloud Burst makes it easy to share photos on social media platforms while respecting privacy settings. You can enable direct sharing to platforms like Instagram and Facebook, with options to add watermarks and maintain photo credits."
  },
  {
    question: "What is your code of conduct policy?",
    answer: "We maintain strict guidelines to ensure appropriate content and respectful behavior. This includes AI-powered content moderation, reporting tools for inappropriate content, and clear guidelines for photo sharing. Our goal is to create a safe, inclusive environment for all users."
  },
  {
    question: "What's included in the Enterprise plan?",
    answer: "Enterprise plans include custom solutions tailored to your organization's needs, including dedicated support, custom AI models, API access, white-label options, and custom integrations. We also offer custom SLAs and advanced security features for enterprise clients."
  },
  {
    question: "How can I get customer support?",
    answer: "Free tier users have access to our help center and community forums. Paid plans include email support, with Pro and Enterprise plans featuring priority support and dedicated account managers. We aim to respond to all inquiries within 24 hours."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your billing cycle. We provide prorated refunds for unused time when downgrading."
  }
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-muted/0 py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <Zap className="h-12 w-12 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your event photography needs. Scale as you grow.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto max-w-7xl py-16 px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`p-8 relative group hover:border-blue-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? 'border-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                {plan.icon}
                <h3 className="mt-6 text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 font-bold">
                  <span className="text-3xl">{plan.price}</span>
                  {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mt-8 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Free Tier" ? (
                <Link href="/auth/register?plan=free">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Get Started with {plan.name}</DialogTitle>
                      <DialogDescription>
                        Fill out the form below and our team will get in touch with you shortly.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Contact Form */}
                    <form className="grid gap-6 mt-4">
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
              )}
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to know about Cloud Burst
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Support CTA */}
          <div className="mt-12 text-center p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help you find the perfect solution for your events.
            </p>
            <Link href="/marketing/contact">
              <Button variant="default">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 