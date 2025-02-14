import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Cloud Capture',
  description: 'Terms and conditions for using Cloud Capture services.'
}

export default function TermsPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: February 2024</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using Cloud Capture ("the Service"), you agree to be bound 
        by these Terms of Service and all applicable laws and regulations.
      </p>

      <h2>2. Use License</h2>
      <p>
        Cloud Capture grants you a limited, non-exclusive, non-transferable license 
        to use the Service for event photography purposes in accordance with these Terms.
      </p>

      <h2>3. User Responsibilities</h2>
      <ul>
        <li>Maintain the security of your account</li>
        <li>Comply with all applicable laws and regulations</li>
        <li>Respect intellectual property rights</li>
        <li>Use the Service responsibly</li>
      </ul>

      <h2>4. Content Rights</h2>
      <p>
        Users retain their rights to any content they submit, post or display on or 
        through the Service. By submitting content, you grant Cloud Capture a worldwide, 
        non-exclusive license to use, process, and store the content.
      </p>

      <h2>5. Privacy and Data Protection</h2>
      <p>
        Your use of the Service is also governed by our Privacy Policy. Please review 
        our Privacy Policy to understand our practices.
      </p>

      <h2>6. Service Modifications</h2>
      <p>
        We reserve the right to modify or discontinue the Service at any time, with 
        or without notice to you.
      </p>
    </article>
  )
}
