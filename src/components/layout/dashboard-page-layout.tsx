'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent layout component for dashboard pages
 * Provides standardized padding and spacing
 */
export function DashboardPageLayout({ 
  children,
  className
}: DashboardPageLayoutProps) {
  return (
    <div className={cn(
      "w-full px-6 sm:px-8 md:px-10 py-6",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Header component for dashboard pages
 */
interface DashboardHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  children,
  className
}: DashboardHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
} 