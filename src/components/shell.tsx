import * as React from "react"

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6" {...props}>
      {children}
    </div>
  )
} 