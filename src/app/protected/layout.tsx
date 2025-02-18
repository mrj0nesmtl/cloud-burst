import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-config'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MainNav } from '@/components/nav/main-nav'
import { UserNav } from '@/components/nav/user-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <UserNav user={session.user} />
        </div>
      </header>

      {/* Main Content */}
      <Suspense fallback={<LoadingSpinner />}>
        <main className="container flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </Suspense>
    </div>
  )
}
