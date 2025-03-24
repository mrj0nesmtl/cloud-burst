"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useMediaStore } from "@/store/media-store";
import { Media } from "@/types/media";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaGrid } from "./MediaGrid";
import { Loader2, Save } from "lucide-react";

const albumFormSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isPublic: z.boolean().default(true),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

interface AlbumCreationFormProps {
  eventId: string;
  availableMedia: Media[];
}

export function AlbumCreationForm({ eventId, availableMedia }: AlbumCreationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { createAlbum, addMediaToAlbum } = useMediaStore();
  
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [coverMedia, setCoverMedia] = useState<Media | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: true,
    },
  });
  
  const onSubmit = async (values: AlbumFormValues) => {
    if (selectedMedia.length === 0) {
      toast({
        title: "No media selected",
        description: "Please select at least one media item for the album",
        variant: "destructive",
      });
      return;
    }
    
    if (!coverMedia) {
      setCoverMedia(selectedMedia[0]);
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the new album
      const album = await createAlbum({
        eventId,
        title: values.title,
        description: values.description || undefined,
        coverMediaId: coverMedia?.id || selectedMedia[0].id,
        isPublic: values.isPublic,
      });
      
      if (!album) {
        throw new Error("Failed to create album");
      }
      
      // Add selected media to the album
      for (const media of selectedMedia) {
        await addMediaToAlbum(album.id, media.id);
      }
      
      toast({
        title: "Album created",
        description: `Successfully created album "${values.title}" with ${selectedMedia.length} media items`,
      });
      
      // Redirect to the album view page
      router.push(`/events/${eventId}/media/albums/${album.id}`);
    } catch (error) {
      console.error("Error creating album:", error);
      toast({
        title: "Error creating album",
        description: "An error occurred while creating the album",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(prev => [...prev, media]);
    
    // If no cover selected yet, use the first selected media
    if (!coverMedia) {
      setCoverMedia(media);
    }
  };
  
  const handleDeselectMedia = (media: Media) => {
    setSelectedMedia(prev => prev.filter(item => item.id !== media.id));
    
    // If this was the cover, reset it
    if (coverMedia?.id === media.id) {
      const newCover = selectedMedia.find(item => item.id !== media.id) || null;
      setCoverMedia(newCover);
    }
  };
  
  const handleSetAsCover = (media: Media) => {
    setCoverMedia(media);
  };
  
  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Album Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter album title" {...field} />
                </FormControl>
                <FormDescription>
                  Give your album a descriptive name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter album description (optional)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a brief description of this album
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Make Album Public</FormLabel>
                  <FormDescription>
                    Public albums are visible to all event participants
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-2">
              Select Media for Album
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedMedia.length === 0
                ? "Select media items to include in this album. Click on images to select them."
                : `${selectedMedia.length} media items selected. ${
                    coverMedia
                      ? `"${coverMedia.title || "Untitled"}" is set as the cover image.`
                      : "Select a cover image by clicking 'Set as Cover'."
                  }`}
            </p>
            
            <MediaGrid
              media={availableMedia}
              selectedMedia={selectedMedia}
              onSelectMedia={handleSelectMedia}
              onDeselectMedia={handleDeselectMedia}
              coverMedia={coverMedia}
              onSetAsCover={handleSetAsCover}
              showSelectionControls={true}
              className="py-4"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/events/${eventId}/media`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Album
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 