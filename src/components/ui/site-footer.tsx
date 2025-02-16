import Link from "next/link"
import { CloudLightning, Github, Instagram, Facebook } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NewsletterForm } from "@/components/ui/newsletter-form"

export function SiteFooter() {
  return (
    <footer className="relative border-t mt-auto bg-muted/50">
      <div className="container flex flex-col py-8 md:py-12 px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center space-x-2">
              <CloudLightning className="h-6 w-6 text-blue-500" />
              <span className="font-semibold">Cloud Burst</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Event Photography Platform
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3 relative z-10">
            <h4 className="font-semibold">Product</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/marketing/about" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                About
              </Link>
              <Link 
                href="/marketing/pricing" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                Pricing
              </Link>
              <Link 
                href="/marketing/contact" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-3 relative z-10">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/legal/privacy" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/terms" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                Terms of Service
              </Link>
              <Link 
                href="/legal/cookies" 
                className="text-sm text-muted-foreground hover:text-blue-500 transition-colors inline-block"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 relative z-10">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and tips.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 relative z-10">
          <span className="text-sm text-muted-foreground">
            © 2025 Cloud Burst. All rights reserved.
          </span>
          <div className="flex items-center space-x-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com/mrj0nesmtl/cloud-capture/blob/main/README.md" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 