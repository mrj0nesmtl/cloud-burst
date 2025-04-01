"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function TemplateNotFound() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{
        maxWidth: '32rem',
        margin: '0 auto',
        textAlign: 'center',
        padding: `${isMobile ? '32px' : '48px'} 0`
      }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Template Not Found
        </h1>
        <p style={{
          color: 'var(--muted-foreground)',
          marginBottom: '32px'
        }}>
          The template you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/protected/templates" style={{
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <ArrowLeft style={{ 
              marginRight: '8px', 
              width: '16px', 
              height: '16px' 
            }} />
            Back to Templates
          </Link>
        </Button>
      </div>
    </div>
  )
} 