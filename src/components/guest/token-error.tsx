import { TokenError } from '@/lib/tokens/invitation-token';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Re-export the TokenError type
export type { TokenError } from '@/lib/tokens/invitation-token';

interface TokenErrorProps {
  error: TokenError;
  onRetry?: () => void;
}

/**
 * Component to display token-related errors to the user
 * with appropriate actions based on the error type
 */
export function TokenErrorAlert({ error, onRetry }: TokenErrorProps) {
  // Error-specific UI content
  const getErrorContent = () => {
    switch (error.type) {
      case 'missing_token':
        return {
          title: 'Missing Invitation',
          icon: <AlertCircle className="h-6 w-6" />,
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button asChild variant="default">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/guest/request-invitation">Request Invitation</Link>
              </Button>
            </div>
          )
        };
        
      case 'expired_token':
        return {
          title: 'Expired Invitation',
          icon: <AlertCircle className="h-6 w-6" />,
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button asChild variant="default">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Event Organizer</Link>
              </Button>
            </div>
          )
        };
        
      case 'revoked_token':
        return {
          title: 'Revoked Invitation',
          icon: <AlertCircle className="h-6 w-6" />,
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button asChild variant="default">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Event Organizer</Link>
              </Button>
            </div>
          )
        };
        
      case 'invalid_token':
      case 'validation_error':
      default:
        return {
          title: 'Invalid Invitation',
          icon: <AlertCircle className="h-6 w-6" />,
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {onRetry && (
                <Button variant="default" onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          )
        };
    }
  };
  
  const content = getErrorContent();
  
  return (
    <Alert variant="destructive" className="mb-6">
      <div className="flex items-start gap-3">
        {content.icon}
        <div>
          <AlertTitle className="text-lg">{content.title}</AlertTitle>
          <AlertDescription className="mt-1">
            {error.userMessage}
          </AlertDescription>
          {content.actions}
        </div>
      </div>
    </Alert>
  );
} 