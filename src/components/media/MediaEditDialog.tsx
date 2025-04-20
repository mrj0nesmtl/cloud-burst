"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Media, MediaType } from '@/types/media';
import { useMediaStore } from '@/store/media-store';
import { useToast } from '@/components/ui/use-toast';
import { ImageIcon, Loader2 } from 'lucide-react';

interface MediaEditDialogProps {
  media: Media | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (media: Media) => void;
  onCancel?: () => void;
}

export function MediaEditDialog({
  media,
  isOpen,
  onOpenChange,
  onSuccess,
  onCancel,
}: MediaEditDialogProps) {
  const { updateMediaItem } = useMediaStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update form values when media changes
  useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setDescription(media.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [media]);

  const handleSave = async () => {
    if (!media) return;
    
    setIsLoading(true);
    try {
      const updatedMedia = await updateMediaItem(
        media.id,
        title,
        description
      );
      
      if (!updatedMedia) {
        throw new Error('Failed to update media');
      }
      
      toast({
        title: 'Media updated',
        description: 'The media details have been updated successfully.',
      });
      
      if (onSuccess) {
        onSuccess(updatedMedia);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating media:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the media details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-3xl w-full p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl">Edit Media Details</DialogTitle>
          <DialogDescription className="text-base">
            Update the title and description for this media item.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          <div className="relative aspect-video rounded-md overflow-hidden border">
            {media.media_type === MediaType.PHOTO ? (
              <Image
                src={media.url}
                alt={title || 'Media preview'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={media.url}
                  className="max-h-full max-w-full"
                  controls
                  playsInline
                />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this media"
                className="h-14 text-lg p-4 w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description (optional)"
                rows={6}
                className="min-h-[180px] text-lg p-4 w-full"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-8 gap-4 flex-col sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={isLoading}
            className="w-full sm:w-auto h-14 text-lg px-8"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full sm:w-auto h-14 text-lg px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 