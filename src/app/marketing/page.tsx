import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full opacity-[0.5]"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero Content */}
      <div className="relative z-10">
        <section className="px-4 py-24 md:py-32">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Capture Every Moment
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered event photography platform for seamless photo sharing and management.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg">Get Started</Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
            
            <div className="mt-16 relative w-full">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src="/pexels-themo-bg.jpg"
                  alt="Event photography showcase"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                />
              </AspectRatio>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 