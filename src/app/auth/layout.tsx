import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      overflow: 'hidden' 
    }}>
      {/* Left Panel - always visible */}
      <div style={{ 
        width: '50%', 
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div style={{ marginBottom: 'auto' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <img 
              src="/cloud-lightning.svg" 
              alt="Cloud Burst Logo" 
              width="24" 
              height="24" 
            />
            Cloud Burst
          </h1>
        </div>
        
        <div>
          <blockquote style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
              "Capture moments, create memories, and share experiences with Cloud Burst - your AI-powered event photography platform."
            </p>
            <footer style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Cloud Burst Team
            </footer>
          </blockquote>
        </div>
      </div>
      
      {/* Right Panel - content */}
      <div style={{ 
        width: '50%', 
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {children}
          
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem',
            marginTop: '1.5rem',
            color: 'var(--muted-foreground)'
          }}>
            By clicking continue, you agree to our{" "}
            <a 
              href="/legal/terms" 
              style={{ 
                textDecoration: 'underline', 
                textUnderlineOffset: '4px',
                color: 'var(--primary)'
              }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a 
              href="/legal/privacy" 
              style={{ 
                textDecoration: 'underline', 
                textUnderlineOffset: '4px',
                color: 'var(--primary)'
              }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}