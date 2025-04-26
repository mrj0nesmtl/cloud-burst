'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

export default function ClearCachePage() {
  const [isCleared, setIsCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleClearCache = () => {
    try {
      // Clear everything in localStorage that might be related to user state
      console.log('Clearing all auth-related caches...');
      localStorage.removeItem('user_capabilities');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('roleState');
      localStorage.removeItem('authUser');
      localStorage.removeItem('profile');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.event');
      
      // Clear any cookies (requires manually refreshing the page)
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      setIsCleared(true);
      setError(null);
      
      console.log('All caches cleared successfully. Please refresh the page or sign out and back in.');
    } catch (err) {
      setError('Failed to clear cache: ' + (err instanceof Error ? err.message : String(err)));
      setIsCleared(false);
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">System Cache Management</h1>
      
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Clear User Cache</CardTitle>
          <CardDescription>
            Use this utility to clear browser caches when testing role changes or after updates.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isCleared && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Cache cleared successfully. Please refresh the page to reload your user data.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-muted-foreground mb-4">
            This will clear your browser's cached user data, including:
          </p>
          
          <ul className="list-disc pl-5 space-y-1 text-sm mb-4">
            <li>User capabilities cache</li>
            <li>Authentication tokens</li>
            <li>Cached preferences</li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            You may need to refresh or sign out and back in after clearing cache.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          
          <Button 
            variant="default"
            onClick={handleClearCache}
          >
            Clear User Cache
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 