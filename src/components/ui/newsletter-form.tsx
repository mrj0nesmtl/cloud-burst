"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterForm() {
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription for:", email)
    setEmail("")
  }

  return (
    <form className="flex space-x-2" onSubmit={handleSubmit}>
      <Input 
        type="email" 
        placeholder="Enter your email"
        className="max-w-[200px]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button size="sm" type="submit">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
} 