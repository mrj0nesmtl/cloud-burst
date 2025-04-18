'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { approveMedia, rejectMedia } from '@/app/protected/gallery/moderate/actions';
import { useToast } from '@/components/ui/use-toast';
import { getProxiedMediaUrl } from '@/lib/utils/media-proxy';

interface Media {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  event_name?: string;
  event_id: string;
}

interface ModerationCardProps {
  media: Media;
  onSuccess?: () => void;
}

export function ModerationCard({ media, onSuccess }: ModerationCardProps) {
  const { toast } = useToast();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get proxied URLs for the media
  const thumbnailUrl = media.thumbnail_url ? getProxiedMediaUrl(media.thumbnail_url) : '';
  const mediaUrl = media.url ? getProxiedMediaUrl(media.url) : '';
  
  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await approveMedia(media.id, reason);
      if (result.success) {
        toast({
          title: 'Media approved',
          description: 'The media has been approved and is now visible in the gallery.',
        });
        setIsApproveDialogOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to approve media',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving media:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!reason) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for rejecting this media.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await rejectMedia(media.id, reason);
      if (result.success) {
        toast({
          title: 'Media rejected',
          description: 'The media has been rejected and is not visible in the gallery.',
        });
        setIsRejectDialogOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to reject media',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting media:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow w-full">
        <div className="relative w-full aspect-video">
          {(thumbnailUrl || mediaUrl) ? (
            <Image 
              src={thumbnailUrl || mediaUrl}
              alt={media.title || 'Media item'} 
              fill
              className="object-cover transition-transform hover:scale-105" 
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageIcon className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-5 flex-grow">
          <h3 className="font-medium text-lg mb-2 truncate">{media.title || 'Untitled'}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            From: {media.event_name || 'Unknown Event'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Uploaded: {new Date(media.created_at).toLocaleDateString()}
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 flex items-center justify-center rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-200"
              onClick={() => setIsApproveDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Approve
            </Button>
            <Button 
              variant="outline"
              className="flex-1 flex items-center justify-center rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive border-red-200"
              onClick={() => setIsRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-5 w-5" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Approve Media</DialogTitle>
            <DialogDescription>
              This will make the media visible to everyone in the gallery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative aspect-video rounded-md overflow-hidden border">
              {mediaUrl ? (
                <Image 
                  src={mediaUrl}
                  alt={media.title || 'Media preview'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="reason" className="text-sm font-medium">
                Optional note (will be visible to the uploader)
              </label>
              <Textarea
                id="reason"
                placeholder="Add an optional note..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Media
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reject Media</DialogTitle>
            <DialogDescription>
              This will reject the media and it will not be visible in the gallery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative aspect-video rounded-md overflow-hidden border">
              {mediaUrl ? (
                <Image 
                  src={mediaUrl}
                  alt={media.title || 'Media preview'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="rejection-reason" className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                Reason for rejection (required)
              </label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why this media is being rejected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
              {!reason && (
                <p className="text-xs text-destructive mt-1">
                  A reason is required when rejecting media.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleReject}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Media
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 