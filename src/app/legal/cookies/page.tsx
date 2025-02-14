import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - Cloud Capture',
  description: 'Learn about how Cloud Capture uses cookies and similar technologies.'
}

export default function CookiesPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Cookie Policy</h1>
      <p className="lead">Last updated: February 2024</p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files that are placed on your device when you visit our website. 
        They help us provide you with a better experience by:
      </p>
      <ul>
        <li>Remembering your preferences</li>
        <li>Understanding how you use our site</li>
        <li>Providing secure authentication</li>
      </ul>

      <h2>2. Types of Cookies We Use</h2>
      <h3>Essential Cookies</h3>
      <p>Required for the website to function properly. These cannot be disabled.</p>

      <h3>Analytics Cookies</h3>
      <p>Help us understand how visitors interact with our website.</p>

      <h3>Functional Cookies</h3>
      <p>Enable enhanced functionality and personalization.</p>

      <h2>3. Managing Cookies</h2>
      <p>
        You can control and/or delete cookies as you wish. You can delete all cookies 
        that are already on your computer and you can set most browsers to prevent 
        them from being placed.
      </p>
    </article>
  )
}
