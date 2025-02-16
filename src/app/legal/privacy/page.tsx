import { Metadata } from 'next'
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: 'Privacy Policy - Cloud Capture',
  description: 'Privacy policy and data protection information for Cloud Capture users.'
}

export default function PrivacyPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2024</p>
        </div>
        <Separator />
        
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Important Notice About Your Photos</AlertTitle>
          <AlertDescription>
            While we implement strong security measures, Cloud Capture is not liable for photos that are 
            shared, leaked, or distributed by event participants or third parties. Please read our full 
            policy regarding image sharing and AI processing below.
          </AlertDescription>
        </Alert>

        <Card className="p-8">
          <div className="space-y-8">
            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">1. Information We Collect</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Account information (email, name, etc.)</li>
                <li>Photos and media you upload</li>
                <li>Event details and metadata</li>
                <li>Usage data and analytics</li>
                <li>Device and location information</li>
                <li>Image metadata and EXIF data</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">2. AI and Machine Learning Processing</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                Cloud Capture employs artificial intelligence and machine learning technologies to process uploaded images for:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Content safety screening and moderation</li>
                <li>Automated event categorization and organization</li>
                <li>Facial recognition for photo grouping (opt-in required)</li>
                <li>Image quality enhancement</li>
                <li>Duplicate detection and removal</li>
                <li>Metadata analysis and cataloging</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                By using our service, you consent to AI processing of your uploaded images. This processing 
                is essential for our service functionality and cannot be disabled.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">3. How We Use Your Information</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                We use the collected information to:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Provide and improve our services</li>
                <li>Process and organize your photos</li>
                <li>Enhance event experiences</li>
                <li>Ensure platform security</li>
                <li>Develop new features and services</li>
                <li>Train and improve our AI systems</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">4. Image Sharing and Liability</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                Please be aware of the following regarding image sharing and liability:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Cloud Capture is not responsible for images shared or distributed by event participants</li>
                <li>Once photos are shared with event attendees, we cannot control their further distribution</li>
                <li>Users should exercise caution when sharing sensitive or private images</li>
                <li>We recommend using our privacy settings to control image access</li>
                <li>Report any unauthorized sharing or misuse immediately</li>
              </ul>
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> While we implement industry-standard security measures, 
                  Cloud Capture cannot guarantee the absolute security of your images or prevent unauthorized 
                  sharing by event participants. By using our service, you acknowledge and accept these risks.
                </p>
              </Card>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">5. Data Retention and Deletion</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                We retain your photos and information according to these guidelines:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Event photos are retained for 30 days after the event by default</li>
                <li>Premium users can extend storage duration</li>
                <li>Deleted images are permanently removed within 48 hours</li>
                <li>Some metadata may be retained for service improvement</li>
                <li>AI training data is anonymized and cannot be deleted</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">6. Contact Us</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                For privacy-related concerns or questions, contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                privacy@cloudcapture.com<br />
                Response time: Within 48 hours
              </p>
            </section>
          </div>
        </Card>
      </div>
    </article>
  )
} 