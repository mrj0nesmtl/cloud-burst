'use client'

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadIcon, FilterIcon } from "lucide-react";
import { useState } from "react";

interface GalleryHeaderProps {
  isOrganizer?: boolean;
  title?: string;
  onUpload?: () => void;
  onFilterChange?: (filter: string) => void;
}

export function GalleryHeader({
  isOrganizer = false,
  title = "Gallery",
  onUpload,
  onFilterChange,
}: GalleryHeaderProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  return (
    <div className="w-full max-w-full flex flex-wrap items-center justify-between gap-2 px-2 sm:px-0">
      <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeFilter} 
          onValueChange={handleFilterChange}
          className="hidden sm:flex"
        >
          <TabsList>
            <TabsTrigger value="all">All Media</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => handleFilterChange(activeFilter === "all" ? "photos" : activeFilter === "photos" ? "videos" : "all")}>
          <FilterIcon className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
        
        {isOrganizer && (
          <Button onClick={onUpload} size="sm" className="sm:size-default whitespace-nowrap">
            <UploadIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Media</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </div>
  );
} 