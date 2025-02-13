import { CloudLightning } from "lucide-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/95">
      <div className="container flex flex-col gap-6 py-8 px-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-10 w-10 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold">Cloud Capture</span>
              <span className="text-sm text-muted-foreground">AI-Powered Event Photography</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cloud Capture. All rights reserved.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-4 sm:flex sm:gap-6 text-sm text-muted-foreground">
          <Link href="/marketing/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/marketing/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/marketing/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            Twitter
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
} 