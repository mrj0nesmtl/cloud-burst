"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log("Newsletter subscription for:", email)
      
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      })
      
      setEmail("")
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form 
      className="flex space-x-2" 
      onSubmit={handleSubmit}
      aria-label="Newsletter subscription form"
    >
      <Input 
        type="email" 
        placeholder="Enter your email"
        className="max-w-[200px]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address"
        disabled={isLoading}
      />
      <Button 
        size="sm" 
        type="submit"
        disabled={isLoading}
        aria-label="Subscribe to newsletter"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Subscribe</span>
      </Button>
    </form>
  )
} 