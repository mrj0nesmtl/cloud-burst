import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Cloud Capture',
  description: 'Privacy policy and data protection information for Cloud Capture users.'
}

export default function PrivacyPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: February 2024</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information that you provide directly to us, including...</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to...</p>

      {/* Add more sections as needed */}
    </article>
  )
} 