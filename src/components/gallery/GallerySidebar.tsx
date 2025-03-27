import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  FolderIcon,
  CalendarIcon,
  UploadIcon,
  ShieldCheckIcon,
  SettingsIcon,
  HeartIcon,
  PlusCircleIcon,
  LayersIcon,
  UserIcon,
  TagIcon,
} from "lucide-react";

interface GallerySidebarProps {
  isOrganizer?: boolean;
  albums?: Array<{ id: string; name: string }>;
  events?: Array<{ id: string; name: string }>;
  onNavigate?: (path: string) => void;
}

export function GallerySidebar({
  isOrganizer = false,
  albums = [],
  events = [],
  onNavigate,
}: GallerySidebarProps) {
  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="pb-12 h-full overflow-auto">
      {/* Main Categories */}
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Browse</h2>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/protected/gallery")}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              All Media
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/protected/gallery/albums")}
            >
              <FolderIcon className="mr-2 h-4 w-4" />
              Albums
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation("/protected/gallery/events")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Events
            </Button>
          </div>
        </div>
        
        {/* Organizer management tools - only for organizers */}
        {isOrganizer && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Manage</h2>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => handleNavigation("/protected/gallery/upload")}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => handleNavigation("/protected/gallery/moderate")}
              >
                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                Moderation
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => handleNavigation("/protected/gallery/settings")}
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Gallery Settings
              </Button>
            </div>
          </div>
        )}
        
        {/* Filter options - for everyone */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Filter</h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <HeartIcon className="mr-2 h-4 w-4" />
              Favorites
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TagIcon className="mr-2 h-4 w-4" />
              Tags
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <UserIcon className="mr-2 h-4 w-4" />
              By People
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <LayersIcon className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </div>
        </div>
        
        {/* Albums - Show available albums */}
        {albums.length > 0 && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Your Albums</h2>
            <div className="space-y-1">
              {albums.map(album => (
                <Button 
                  key={album.id} 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleNavigation(`/protected/gallery/albums/${album.id}`)}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  {album.name}
                </Button>
              ))}
              {isOrganizer && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => handleNavigation("/protected/gallery/albums/create")}
                >
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Create Album
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Events - Show available events */}
        {events.length > 0 && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Your Events</h2>
            <div className="space-y-1">
              {events.map(event => (
                <Button 
                  key={event.id} 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleNavigation(`/protected/gallery/events/${event.id}`)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {event.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 