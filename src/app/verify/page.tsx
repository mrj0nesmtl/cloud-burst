import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // If no code provided, redirect to home
  if (!searchParams.code) {
    redirect('/');
  }

  try {
    // Check if user is already verified
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email_confirmed_at) {
      // User is already verified, show already verified message
      return (
        <div className="container max-w-md mx-auto py-10">
          <Card className="p-6 space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Already Verified!</h1>
              <p className="text-muted-foreground">
                Your email has already been verified. You can continue using Cloud Burst.
              </p>
            </div>
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={() => {
                  window.location.href = '/protected/dashboard';
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Attempt to verify the email
    const { error } = await supabase.auth.verifyOtp({
      token_hash: searchParams.code,
      type: 'email',
    });

    if (error) {
      throw error;
    }

    // Update user role to organizer
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'organizer',
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id);

    if (updateError) {
      throw updateError;
    }

    // Redirect to onboarding
    redirect('/protected/onboarding');

  } catch (error) {
    // Show error state
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card className="p-6 space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">
              The verification link has expired or is invalid. Please request a new verification email.
            </p>
          </div>
          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={() => {
                window.location.href = '/auth/resend-verification';
              }}
            >
              Request New Verification
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
