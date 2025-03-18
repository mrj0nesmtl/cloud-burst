import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Settings | Cloud Burst',
  description: 'Manage your profile settings and account information',
};

// This page simply redirects to the existing profile settings page
export default function ProfileSettingsRedirectPage() {
  // Redirect to the main profile page
  redirect('/protected/profile');
} 