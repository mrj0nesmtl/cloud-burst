import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Shell } from '@/components/shell';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export const metadata: Metadata = {
  title: 'Welcome to Cloud Burst - Complete Your Profile',
  description: 'Set up your event organizer profile and create your first event.'
};

export default async function OnboardingPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/signin');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile is already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect('/protected/dashboard');
  }

  return (
    <div className="auth-container py-8 flex justify-center">
      <Shell className="max-w-lg mx-auto bg-card rounded-lg shadow-md">
        <OnboardingFlow user={user} profile={profile} />
      </Shell>
    </div>
  );
}
