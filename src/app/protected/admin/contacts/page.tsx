import { Metadata } from 'next'
import { ContactSubmissions } from '@/components/dashboard/contact-submissions'

export const metadata: Metadata = {
  title: 'Contact Submissions | Cloud Burst',
  description: 'Manage contact form submissions for Cloud Burst platform',
}

export default function ContactSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contact Form Submissions</h2>
        <p className="text-muted-foreground">
          Manage and respond to contact form submissions from users.
        </p>
      </div>
      
      <ContactSubmissions />
    </div>
  )
} 