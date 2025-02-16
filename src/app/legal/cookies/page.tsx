import { Metadata } from 'next'
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { CookieConsent } from "@/components/cookie-consent"

export const metadata: Metadata = {
  title: 'Cookie Policy - Cloud Capture',
  description: 'Learn about how Cloud Capture uses cookies and similar technologies.'
}

export default function CookiesPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2024</p>
        </div>
        <Separator />
        
        <Alert className="mb-6">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>Cookie Consent</AlertTitle>
          <AlertDescription>
            By continuing to use our site, you consent to our use of cookies in accordance with this policy.
            You can manage your preferences using our cookie settings panel.
          </AlertDescription>
        </Alert>

        <Card className="p-8">
          <div className="space-y-8">
            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">1. What Are Cookies</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Remembering your preferences and settings</li>
                <li>Understanding how you use our platform</li>
                <li>Providing secure authentication</li>
                <li>Enabling AI-powered features</li>
                <li>Improving platform performance</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">2. Types of Cookies We Use</h2>
              <div className="space-y-4 mt-4">
                <Card className="p-4">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for core platform functionality. These cannot be disabled and include:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                    <li>Authentication tokens</li>
                    <li>Security features</li>
                    <li>Session management</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Functional Cookies</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enhance your experience with features like:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                    <li>Remembering preferences</li>
                    <li>AI processing settings</li>
                    <li>Interface customization</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Performance Cookies</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us improve our platform through:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                    <li>Usage analytics</li>
                    <li>Error monitoring</li>
                    <li>Performance tracking</li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">3. Managing Your Preferences</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                You can manage your cookie preferences at any time:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Use our cookie settings panel</li>
                <li>Adjust your browser settings</li>
                <li>Contact our support team</li>
              </ul>
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Disabling certain cookies may limit your access to some platform features.
                </p>
              </Card>
            </section>
          </div>
        </Card>

        <CookieConsent />
      </div>
    </article>
  )
}
