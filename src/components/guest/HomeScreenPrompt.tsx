'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface HomeScreenPromptProps {
  context?: 'dashboard' | 'gallery' | 'camera' | 'generic';
  delay?: number; // Time in ms before showing the prompt
}

export function HomeScreenPrompt({ 
  context = 'generic', 
  delay = 5000 
}: HomeScreenPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Check if already installed or dismissed
    const hasPrompted = localStorage.getItem('homescreen-prompted')
    if (hasPrompted) {
      // We could make this smarter by checking the date when we retrieve it
      const promptTime = parseInt(hasPrompted, 10);
      const now = Date.now();
      const daysDifference = (now - promptTime) / (1000 * 60 * 60 * 24);
      
      // If it's been less than 7 days since the last prompt, don't show again
      if (daysDifference < 7) return;
    }
    
    // Detect if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)
    
    // Check if already in standalone mode (installed PWA)
    const isInStandaloneMode = () => {
      return (window.matchMedia('(display-mode: standalone)').matches) || 
             (window.navigator as any).standalone === true;
    }
    
    setIsStandalone(isInStandaloneMode())
    
    // Show prompt after a delay if not standalone
    if (!isInStandaloneMode()) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [delay])
  
  // Add contextual messaging
  const getContextMessage = () => {
    switch (context) {
      case 'dashboard':
        return 'Add this dashboard to your home screen for quick access to your event!';
      case 'gallery':
        return 'Add the gallery to your home screen to easily view and share photos!';
      case 'camera':
        return 'Add to your home screen for quick access to the camera!';
      default:
        return 'Add to your home screen for easier access!';
    }
  };
  
  const dismissPrompt = () => {
    setShowPrompt(false)
    // Remember for 7 days
    localStorage.setItem('homescreen-prompted', Date.now().toString())
  }

  if (!showPrompt || isStandalone) return null
  
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h3 className="font-semibold">Add to Home Screen</h3>
              <p className="text-sm text-muted-foreground">
                {getContextMessage()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isIOS 
                  ? 'Tap the share icon and then "Add to Home Screen"'
                  : 'Tap the menu and select "Add to Home Screen"'
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 