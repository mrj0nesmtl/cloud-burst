'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ConsistentGridProps {
  children: React.ReactNode;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * A consistent grid layout component for gallery items
 * This ensures the same grid layout is used across all gallery tabs
 */
export function ConsistentGrid({ 
  children, 
  emptyState, 
  isLoading,
  className 
}: ConsistentGridProps) {
  // Show loading state if loading is true
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Show empty state if no children and empty state is provided
  if (React.Children.count(children) === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }
  
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          padding: '4px'
        }}
      >
        {children}
      </div>
    </ScrollArea>
  );
} 