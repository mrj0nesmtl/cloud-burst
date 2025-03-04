import Link from "next/link"
import { CloudLightning, Github, Instagram, Facebook } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NewsletterForm } from "@/components/ui/newsletter-form"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border mt-auto bg-muted/30">
      <div className="hexagon-pattern opacity-5"></div>
      <div className="container flex flex-col py-10 md:py-16 px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center space-x-2 group">
              <CloudLightning className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">Cloud Burst</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Event Photography Platform
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4 relative z-10">
            <h4 className="font-semibold text-primary">Product</h4>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/marketing/about" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                About
              </Link>
              <Link 
                href="/marketing/pricing" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                Pricing
              </Link>
              <Link 
                href="/marketing/contact" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4 relative z-10">
            <h4 className="font-semibold text-primary">Legal</h4>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/legal/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                Terms of Service
              </Link>
              <Link 
                href="/legal/cookies" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 relative z-10">
            <h4 className="font-semibold text-primary">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and tips.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 relative z-10">
          <span className="text-sm text-muted-foreground">
            © 2025 Cloud Burst. All rights reserved.
          </span>
          <div className="flex items-center space-x-4">
            {/* Instagram icon without link */}
            <span className="text-muted-foreground cursor-not-allowed opacity-50 transition-opacity hover:opacity-70">
              <Instagram className="h-5 w-5" />
            </span>
            
            {/* Facebook icon without link */}
            <span className="text-muted-foreground cursor-not-allowed opacity-50 transition-opacity hover:opacity-70">
              <Facebook className="h-5 w-5" />
            </span>
            
            {/* Updated GitHub link */}
            <a 
              href="https://github.com/mrj0nesmtl/cloud-burst" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 