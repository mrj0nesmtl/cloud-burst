import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { 
    error?: string;
    error_code?: string;
    error_description?: string;
  };
}) {
  // Determine the error type and show appropriate message
  const isExpiredLink = searchParams.error_code === 'otp_expired';
  const errorTitle = isExpiredLink 
    ? 'Verification Link Expired'
    : 'Authentication Error';
  const errorDescription = searchParams.error_description 
    || 'There was a problem with authentication. Please try again.';

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="p-6 space-y-4">
        <div className="flex justify-center">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{errorTitle}</h1>
          <p className="text-muted-foreground">
            {errorDescription}
          </p>
        </div>
        <div className="pt-4 space-y-2">
          {isExpiredLink ? (
            <>
              <Button 
                asChild
                className="w-full"
              >
                <Link href="/auth/resend-verification">
                  Request New Verification Link
                </Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                The verification link has expired. Please request a new one.
              </p>
            </>
          ) : (
            <>
              <Button 
                asChild
                className="w-full"
              >
                <Link href="/auth/sign-in">
                  Return to Sign In
                </Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                If the problem persists, please contact support.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 