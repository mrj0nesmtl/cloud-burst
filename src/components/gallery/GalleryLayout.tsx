'use client';

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
    <div className={cn("h-full flex flex-col max-w-full", className)}>
      {header && (
        <div className="border-b w-full max-w-full">
          <div className="flex h-14 sm:h-16 items-center w-full max-w-full overflow-hidden">
            {sidebar && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2 flex-shrink-0" 
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}
            <div className="w-full max-w-full overflow-hidden">
              {header}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative w-full max-w-full">
        {sidebar && (
          <aside 
            className={cn(
              "bg-background transition-all duration-300 ease-in-out z-20",
              isMobile ? (
                sidebarOpen 
                  ? "fixed inset-y-0 left-0 w-[220px] shadow-lg border-r"
                  : "hidden"
              ) : (
                "w-[220px] flex-shrink-0 border-r"
              )
            )}
          >
            {sidebar}
          </aside>
        )}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          "max-w-full w-full",
          isMobile && sidebarOpen ? "ml-0" : ""
        )}>
          <div className="max-w-full overflow-x-hidden w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 