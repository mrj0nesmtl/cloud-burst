'use client'

import { useEffect, useState, useRef } from "react";
import { MediaCard, MediaItem, Comment } from "./MediaCard";
import { MediaStatus } from "@/types/media";

interface MasonryGridProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  showComments?: boolean;
  isPublic?: boolean;
  onAddComment?: (mediaId: string, comment: string) => void;
  onLike?: (mediaId: string) => void;
}

export function MasonryGrid({
  items,
  onItemClick,
  showComments = false,
  isPublic = false,
  onAddComment,
  onLike
}: MasonryGridProps) {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle resize to determine number of columns
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Further adjusted breakpoints for even more columns
      if (width < 480) {
        setColumns(1); // Single column for very small devices
      } else if (width < 640) {
        setColumns(2); // Two columns for mobile phones
      } else if (width < 768) {
        setColumns(3); // Three columns for larger phones/small tablets
      } else if (width < 1024) {
        setColumns(4); // Four columns for tablets (increased from 3)
      } else if (width < 1280) {
        setColumns(5); // Five columns for small desktops (increased from 4)
      } else {
        setColumns(6); // Six columns for large desktops (increased from 5)
      }
    };
    
    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Direct styling for improved responsiveness
  const getGridStyle = () => {
    // Use CSS Grid for larger screens, stack for very small screens
    if (columns === 1) {
      return {
        display: 'flex',
        flexDirection: 'column' as 'column', // TypeScript needs this casting
        gap: '8px', // Further reduced from 12px
        width: '100%',
        maxWidth: '100%'
      };
    }
    
    // For multi-column layouts, use grid with even tighter spacing
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '8px', // Further reduced from 12px
      width: '100%',
      maxWidth: '100%'
    };
  };
  
  // Distribute items into columns
  const columnItems = Array.from({ length: columns }, () => [] as MediaItem[]);
  
  // Distribute items based on height estimation to create a more balanced layout
  items.forEach((item) => {
    // Find the column with the fewest items
    const shortestColumnIndex = columnItems
      .map((column, index) => ({ 
        index, 
        height: column.reduce((sum, item) => {
          // Estimate height based on aspectRatio or use 1 for default
          const aspectRatio = (item.width && item.height) 
            ? item.width / item.height 
            : 1;
          return sum + (1 / aspectRatio);
        }, 0) 
      }))
      .sort((a, b) => a.height - b.height)[0].index;
    
    columnItems[shortestColumnIndex].push(item);
  });
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <p className="text-lg font-medium mb-2">No media found</p>
        <p className="text-muted-foreground">Upload some photos or videos to see them here.</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full px-0.5 sm:px-1" // Reduced padding further from px-1 sm:px-2
      style={{ 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div style={getGridStyle()}>
        {columns === 1 ? (
          // Single column layout (mobile) - flat list of items
          items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={onItemClick}
              showComments={showComments}
              isPublic={isPublic}
              onAddComment={onAddComment}
              onLike={onLike}
              className="w-full max-w-full scale-90" // Increase scale reduction
            />
          ))
        ) : (
          // Multi-column layout
          columnItems.map((columnItems, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-2 w-full"> {/* Further reduced gap from 3 to 2 */}
              {columnItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onClick={onItemClick}
                  showComments={showComments}
                  isPublic={isPublic}
                  onAddComment={onAddComment}
                  onLike={onLike}
                  className="w-full scale-90" // Increase scale reduction
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 