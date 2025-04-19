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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Media Details</DialogTitle>
          <DialogDescription>
            Update the title and description for this media item.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
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
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this media"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description (optional)"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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