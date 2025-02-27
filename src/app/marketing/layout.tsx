import { NavigationMenu } from "@/components/ui/navigation-menu"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/pexels-themo1-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: '0.20' // Changed to 75% transparent (0.25 opacity)
        }}
      />
      
      {/* Content without blur */}
      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <NavigationMenu />
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 