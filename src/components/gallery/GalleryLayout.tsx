import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {header && (
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            {header}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <aside className={cn(
            "w-[300px] flex-shrink-0 border-r",
            isPublic ? "hidden md:block" : ""
          )}>
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 