"use client"

import { useAuthStore } from "@/lib/auth/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const { user } = useAuthStore()
  const { toast } = useToast()

  const showUserInfo = () => {
    toast({
      title: "Current User Info",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(user, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <div className="fixed bottom-4 right-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showUserInfo}
      >
        Debug Auth
      </Button>
    </div>
  )
} 