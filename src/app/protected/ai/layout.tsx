'use client'

import { Metadata } from 'next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Cpu, 
  Sparkles, 
  ShoppingBag, 
  Tags, 
  BrainCircuit, 
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'AI Features | Cloud Burst',
  description: 'Advanced AI tools for photo and video analysis and enhancement',
}

interface AILayoutProps {
  children: React.ReactNode
}

export default function AILayout({ children }: AILayoutProps) {
  const pathname = usePathname()
  const currentPath = pathname.split('/').pop()

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/protected/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">AI Features</h1>
        </div>
        <p className="text-muted-foreground">
          Advanced artificial intelligence tools for photo and video analysis and enhancement
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue={currentPath} className="w-full">
        <TabsList className="w-full overflow-x-auto flex whitespace-nowrap py-1 justify-start">
          <Link href="/protected/ai/facial-recognition" passHref className="flex-1 max-w-[200px]">
            <TabsTrigger value="facial-recognition" className="gap-2 w-full">
              <Cpu className="h-4 w-4" />
              <span>Facial Recognition</span>
            </TabsTrigger>
          </Link>
          <Link href="/protected/ai/enhancements" passHref className="flex-1 max-w-[200px]">
            <TabsTrigger value="enhancements" className="gap-2 w-full">
              <Sparkles className="h-4 w-4" />
              <span>Enhancements</span>
            </TabsTrigger>
          </Link>
          <Link href="/protected/ai/product-placements" passHref className="flex-1 max-w-[200px]">
            <TabsTrigger value="product-placements" className="gap-2 w-full">
              <ShoppingBag className="h-4 w-4" />
              <span>Product Placements</span>
            </TabsTrigger>
          </Link>
          <Link href="/protected/ai/smart-tagging" passHref className="flex-1 max-w-[200px]">
            <TabsTrigger value="smart-tagging" className="gap-2 w-full">
              <Tags className="h-4 w-4" />
              <span>Smart Tagging</span>
            </TabsTrigger>
          </Link>
          <Link href="/protected/ai/studio" passHref className="flex-1 max-w-[200px]">
            <TabsTrigger value="studio" className="gap-2 w-full">
              <BrainCircuit className="h-4 w-4" />
              <span>AI Studio</span>
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        {children}
      </div>
    </div>
  )
} 