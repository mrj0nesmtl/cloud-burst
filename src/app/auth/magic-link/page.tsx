"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import Link from "next/link";

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function validateMagicLink() {
      // No token provided
      if (!token) {
        setStatus("error");
        setError("Invalid or missing access link. Please request a new one.");
        return;
      }
      
      try {
        const response = await fetch("/api/auth/magic-link/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to validate access link");
        }
        
        // Success - mark as authenticated
        setStatus("success");
        
        // Redirect to guest dashboard after short delay
        setTimeout(() => {
          router.push(data.redirectUrl || "/guest/dashboard");
        }, 1500);
        
      } catch (error) {
        console.error("Magic link validation error:", error);
        setStatus("error");
        setError(error instanceof Error ? error.message : "Failed to validate your access link. It may have expired or been used already.");
      }
    }
    
    validateMagicLink();
  }, [token, router]);
  
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image src="/android-chrome-192x192.png" alt="Cloud Burst Logo" width={120} height={120} priority />
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Accessing Your Dashboard</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your secure link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">Verifying your secure access link...</p>
              </div>
            )}
            
            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your access link is valid. Redirecting you to your dashboard...
                </AlertDescription>
              </Alert>
            )}
            
            {status === "error" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                
                <div className="flex justify-center">
                  <Button asChild>
                    <Link href="/guest-access">Request New Access Link</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 