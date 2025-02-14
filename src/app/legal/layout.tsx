export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container max-w-3xl py-12">
      <div className="prose dark:prose-invert">
        {children}
      </div>
    </div>
  )
} 