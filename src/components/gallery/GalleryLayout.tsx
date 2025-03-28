import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface GalleryLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
  isPublic?: boolean;
}

export function GalleryLayout({
  children,
  sidebar,
  header,
  className,
  isPublic = false,
}: GalleryLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and close sidebar by default on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Close sidebar by default on mobile
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {header && (
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            {sidebar && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
            {header}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {sidebar && (
          <aside 
            className={cn(
              "bg-background transition-all duration-300 ease-in-out z-20",
              isMobile ? (
                sidebarOpen 
                  ? "absolute inset-y-0 left-0 w-[250px] shadow-lg border-r" 
                  : "hidden"
              ) : (
                "w-[250px] flex-shrink-0 border-r"
              )
            )}
          >
            {sidebar}
          </aside>
        )}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          isMobile && sidebarOpen && "ml-[250px]"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 