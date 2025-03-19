import { Card } from '@/components/ui/card';
import { ResendVerificationForm } from '@/components/auth/resend-verification-form';

export default function ResendVerificationPage() {
  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Resend Verification Email</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a new verification link.
          </p>
        </div>
        <ResendVerificationForm />
      </Card>
    </div>
  );
} 