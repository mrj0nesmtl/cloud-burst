import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CompletionStepProps {
  profile: any;
  event: any;
  onComplete: () => void;
}

export function CompletionStep({ profile, event, onComplete }: CompletionStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground mt-2">
          {event 
            ? "Your account has been set up and your first event is ready to go."
            : "Your account has been set up and you're ready to explore Cloud Burst."}
        </p>
      </div>

      <div className="space-y-4 bg-muted p-6 rounded-lg text-left">
        <h3 className="font-semibold">What's Next?</h3>
        <ul className="space-y-3">
          {event ? (
            <>
              <li className="flex items-start">
                <span className="mr-2">👥</span>
                <span>Invite staff and photographers to help manage your event</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>Generate QR codes for guest photo uploads</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎨</span>
                <span>Customize your event page and gallery settings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Track uploads and engagement in real-time</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Explore the dashboard and familiarize yourself with the features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📅</span>
                <span>Create your first event when you're ready</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚙️</span>
                <span>Customize your profile settings and preferences</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                <span>Check out our guides and tutorials in the help center</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="pt-4">
        <Button
          onClick={onComplete}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 