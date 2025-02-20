import { AuthDebug } from "@/components/auth/auth-debug"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6">
      {children}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </div>
  )
} 