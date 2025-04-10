import React from 'react'

// Add debug logging
console.log('Loading invitation/[token]/layout.tsx - parent layout for parallel routes')

// This layout defines slots for parallel routes
export default function InvitationLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { token: string }
}) {
  // Return children wrapped in a container
  return (
    <div className="invitation-container">
      {children}
    </div>
  )
} 