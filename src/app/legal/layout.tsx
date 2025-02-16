import { Separator } from "@/components/ui/separator"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container relative">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div className="flex-1 space-y-4">
            {children}
          </div>
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  )
} 