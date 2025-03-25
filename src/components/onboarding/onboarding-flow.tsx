"use client"

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileSetup } from './steps/profile-setup';
import { EventSetup } from './steps/event-setup';
import { CompletionStep } from './steps/completion';

interface OnboardingFlowProps {
  user: User;
  profile: any; // TODO: Add proper profile type
}

export function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState(profile || {});
  const [eventData, setEventData] = useState({});
  
  const steps = [
    {
      title: 'Set Up Your Profile',
      description: 'Tell us about yourself and customize your organizer profile.'
    },
    {
      title: 'Create Your First Event',
      description: 'Get started by creating your first event.'
    },
    {
      title: 'You\'re All Set!',
      description: 'Your account is ready to go.'
    }
  ];

  return (
    <div className="container max-w-3xl mx-auto py-10">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${step > i ? 'bg-blue-600 text-white' : 
                  step === i + 1 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
                  'bg-gray-100 text-gray-400'}
              `}>
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`
                  w-24 h-1 mx-2
                  ${step > i ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((s, i) => (
            <div key={i} className="w-24 text-center">
              <h4 className="text-sm font-medium">{s.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="p-6">
        <div className="space-y-6">
          {step === 1 && (
            <ProfileSetup 
              user={user}
              initialData={profileData}
              onComplete={(data) => {
                setProfileData(data);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <EventSetup
              user={user}
              profile={profileData}
              onComplete={(data) => {
                setEventData(data);
                setStep(3);
              }}
            />
          )}
          {step === 3 && (
            <CompletionStep
              profile={profileData}
              event={eventData}
              onComplete={() => {
                window.location.href = '/protected/dashboard';
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
} 