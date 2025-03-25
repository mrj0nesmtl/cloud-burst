import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Invitation',
  description: 'Create a new invitation for your event',
}

export default function InvitationCreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 