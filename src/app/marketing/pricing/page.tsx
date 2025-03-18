import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Package, 
  Star, 
  Zap,
  CheckCircle2,
  Crown,
  Building2,
  ArrowRight,
  Info,
  CloudLightning
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import "@/styles/layout.css"

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
    modalContent: {
      title: "Free Tier Details",
      description: `Start your journey with Cloud Burst's essential features.

      What's Included:
      • Up to 100 photos per event
      • Basic AI-powered photo organization
      • Standard quality photo enhancement
      • Basic gallery customization
      • Community support access
      • Standard upload speeds
      • Basic analytics
      
      Perfect For:
      • Small gatherings
      • Personal events
      • Testing the platform
      • Basic photo sharing needs`,
    },
    popular: false,
    route: "/auth/register?plan=free"
  },
  {
    name: "Basic",
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
    modalContent: {
      title: "Basic Features",
      description: `Enhanced features for better event coverage and organization.

      Advanced Features:
      • Up to 500 high-quality photos per event
      • Advanced AI photo enhancement
      • Custom gallery branding
      • Priority email support
      • Advanced analytics dashboard
      • 30-day storage
      • Multiple event management
      
      Best For:
      • Wedding photographers
      • Small business events
      • Community gatherings
      • Professional portfolios`,
    },
    popular: true,
    route: "/auth/register?plan=basic"
  },
  {
    name: "Pro",
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
    modalContent: {
      title: "Professional Benefits",
      description: `Complete solution for professional event photography needs.

      Premium Features:
      • Unlimited photo storage
      • Premium AI enhancement tools
      • White-label galleries
      • 24/7 priority support
      • Advanced analytics suite
      • API access for integration
      • Custom workflow automation
      
      Ideal For:
      • Professional photographers
      • Large-scale events
      • Marketing agencies
      • Event planning companies`,
    },
    popular: false,
    route: "/auth/register?plan=pro"
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
    modalContent: {
      title: "Enterprise Solutions",
      description: `Tailored solutions for large organizations and agencies.

      Enterprise Features:
      • Custom AI model training
      • Dedicated account manager
      • Custom API integration
      • Advanced security features
      • Custom SLA agreements
      • Multi-team management
      • Brand customization
      
      Perfect For:
      • Large corporations
      • Event agencies
      • Venue chains
      • Global brands`,
    },
    popular: false,
    comingSoon: true,
    route: "/auth/register?plan=enterprise"
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
      <section className="hero-section py-8" style={{ minHeight: '30vh' }}>
        <div className="hexagon-pattern opacity-15"></div>
        <div className="container-md mx-auto px-4">
          <div className="hero-logo mb-4">
            <CloudLightning className="h-12 w-12 text-primary" />
          </div>
          <h1 className="hero-title mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="hero-subtitle mb-6">
            Choose the perfect plan for your event photography needs. Scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section py-10">
        <div className="container-lg mx-auto px-4">
          <div className="card-grid md-grid-cols-2 lg-grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`
                  relative flex flex-col p-6 shadow-md hover:shadow-lg transition-all border 
                  ${plan.popular ? 'border-primary shadow-primary/10' : 'border-border'}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full shadow-lg">
                    Coming Soon
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <div className="feature-icon mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="feature-title mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-muted-foreground">/event</span>}
                  </div>
                  <p className="feature-description mb-6">
                    {plan.description}
                  </p>
                </div>
                
                <div className="flex flex-col flex-grow">
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col mt-auto space-y-3">
                    <Button 
                      asChild 
                      className={`w-full ${plan.popular ? 'btn-primary' : ''}`}
                    >
                      <Link href={plan.route}>
                        Get Started
                      </Link>
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          <span className="flex items-center">
                            Learn more <ArrowRight className="ml-1 h-4 w-4" />
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{plan.modalContent.title}</DialogTitle>
                          <DialogDescription className="whitespace-pre-line pt-2">
                            {plan.modalContent.description}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <div className="container-md mx-auto max-w-4xl py-16">
            <div className="text-center mb-12">
              <h2 className="section-title mb-4 text-primary">
                Frequently Asked Questions
              </h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Find answers to common questions about our pricing, features, and services.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="section py-10 bg-muted/50">
        <div className="container-md mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title mb-4">Need a Custom Solution?</h2>
            <p className="section-subtitle mb-8">
              Our enterprise plans are tailored to your specific needs. Contact our sales team to discuss your requirements.
            </p>
            <Button size="lg" asChild>
              <Link href="/marketing/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 