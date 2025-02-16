import { Metadata } from 'next'
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: 'Terms of Service - Cloud Capture',
  description: 'Terms and conditions for using Cloud Capture services.'
}

export default function TermsPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 2024</p>
        </div>
        <Separator />

        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Important Legal Notice</AlertTitle>
          <AlertDescription>
            By using Cloud Capture, you acknowledge and accept that we provide the service "as is" 
            without any warranties. We are not liable for any damages, losses, or consequences 
            arising from the use of our service.
          </AlertDescription>
        </Alert>

        <Card className="p-8">
          <div className="space-y-8">
            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">1. Acceptance of Terms</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                By accessing or using Cloud Capture ("the Service"), you agree to be legally bound by:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>These Terms of Service in their entirety</li>
                <li>Our Privacy Policy</li>
                <li>Any additional terms and conditions</li>
                <li>All applicable laws and regulations</li>
              </ul>
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  If you do not agree to these terms, you must immediately cease using the Service.
                </p>
              </Card>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">2. Disclaimer of Warranties</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Cloud Capture explicitly disclaims:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>All warranties, whether express or implied</li>
                <li>Guarantees of service availability or uptime</li>
                <li>Accuracy or reliability of photo processing</li>
                <li>Security of uploaded content</li>
                <li>Fitness for any particular purpose</li>
                <li>Data loss or corruption prevention</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">3. Limitation of Liability</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                Cloud Capture and its affiliates shall not be liable for:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Any direct, indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Unauthorized access to or use of your data</li>
                <li>Actions of third parties or event participants</li>
                <li>Technical failures or service interruptions</li>
                <li>Content moderation decisions</li>
              </ul>
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Maximum Liability:</strong> In any case, our total liability shall not exceed 
                  the amount you paid for the Service in the past 12 months, if any.
                </p>
              </Card>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">4. AI and Automated Processing</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                By using the Service, you acknowledge and agree that:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Your content will be processed by AI and machine learning systems</li>
                <li>AI processing results may not be perfect or complete</li>
                <li>We may use anonymized data for AI training</li>
                <li>AI features may be modified or removed at any time</li>
                <li>You cannot opt out of essential AI processing</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">5. Indemnification</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                You agree to indemnify and hold harmless Cloud Capture from:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Claims arising from your use of the Service</li>
                <li>Violations of these Terms</li>
                <li>Infringement of third-party rights</li>
                <li>Content you upload or share</li>
                <li>Interactions with other users</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">6. Termination</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                Cloud Capture reserves the right to:
              </p>
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Terminate or suspend your account without notice</li>
                <li>Remove any content without warning</li>
                <li>Modify or discontinue the Service</li>
                <li>Change these Terms at any time</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">7. Governing Law</h2>
              <p className="leading-7 [&:not(:first-child)]:mt-4">
                These Terms shall be governed by and construed in accordance with the laws of Canada, 
                without regard to its conflict of law provisions.
              </p>
              <Card className="p-4 bg-muted mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Dispute Resolution:</strong> Any disputes shall be resolved exclusively 
                  through arbitration in Canada. You waive any right to participate in class 
                  actions or class arbitrations.
                </p>
              </Card>
            </section>
          </div>
        </Card>
      </div>
    </article>
  )
}
