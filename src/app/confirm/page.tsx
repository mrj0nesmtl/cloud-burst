'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      // Get parameters
      const token = searchParams.get('token');
      const eventId = searchParams.get('eventId');
      
      console.log("Confirm page loaded with params:", { token, eventId });
      
      if (!token || !eventId) {
        setError("Missing required parameters");
        return;
      }
      
      // Redirect to the proper confirmation page
      const url = `/event/${eventId}/confirmed?token=${token}`;
      console.log("Redirecting to:", url);
      
      // Use a short delay to ensure logging happens
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    } catch (error) {
      console.error("Error in confirm page:", error);
      setError("An error occurred during redirect");
    }
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p>Please wait while we redirect you to the confirmation page.</p>
        </div>
      )}
    </div>
  );
} 