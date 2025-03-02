import { Metadata } from 'next'
import { NewsletterSubscribers } from '@/components/dashboard/newsletter-subscribers'

export const metadata: Metadata = {
  title: 'Newsletter Subscribers | Cloud Burst',
  description: 'Manage newsletter subscribers for Cloud Burst platform',
}

export default function NewsletterSubscribersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h2>
        <p className="text-muted-foreground">
          Manage newsletter subscribers and export subscriber lists.
        </p>
      </div>
      
      <NewsletterSubscribers />
    </div>
  )
} 