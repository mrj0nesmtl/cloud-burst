import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Github, CloudLightning } from "lucide-react"

export const metadata: Metadata = {
  title: "Login | Cloud Capture",
  description: "Login to your Cloud Capture account",
}

export default function LoginPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <CloudLightning className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <Card className="p-6">
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <Button className="w-full">Sign In</Button>
            </div>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" type="button">
            <Github className="mr-2 h-4 w-4" />
            Github
          </Button>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/auth/register" className="hover:text-brand underline underline-offset-4">
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
} 