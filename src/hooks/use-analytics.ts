"use client"

type AnalyticsEvent = {
  name: string
  properties?: Record<string, any>
}

export function useAnalytics() {
  const track = async (event: string, properties?: Record<string, any>) => {
    try {
      // For now, just console log the events
      console.log('Analytics Event:', { event, properties })
      
      // TODO: Implement real analytics tracking
      // Example: Send to Vercel Analytics, Google Analytics, etc.
    } catch (error) {
      console.error('Analytics Error:', error)
    }
  }

  return { track }
} 