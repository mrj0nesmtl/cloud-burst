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
    <div className="w-full flex items-center justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
      
      <div className="flex items-center gap-4">
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
        
        <Button variant="ghost" size="icon" className="sm:hidden">
          <FilterIcon className="h-4 w-4" />
        </Button>
        
        {isOrganizer && (
          <Button onClick={onUpload}>
            <UploadIcon className="mr-2 h-4 w-4" />
            Add Media
          </Button>
        )}
      </div>
    </div>
  );
} 