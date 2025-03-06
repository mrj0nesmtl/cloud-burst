'use client';

import Link from "next/link";
import { CloudLightning, ExternalLink, Instagram, Facebook, Github, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Subscribed!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border/40">
      <div className="mx-auto max-w-[1400px] w-full p-8">
        {/* Using the custom footer-layout class from layout.css to avoid grid conflicts */}
        <div className="footer-layout">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <CloudLightning className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Cloud Burst</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Capture, store, and share your event memories with our professional photography platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/marketing/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/events" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Events <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/marketing/pricing" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/marketing/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/legal/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/cookies" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cookies
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/licenses" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Licenses
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-medium mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row justify-between items-center">
          {/* Social links */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cloud Burst. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
} 