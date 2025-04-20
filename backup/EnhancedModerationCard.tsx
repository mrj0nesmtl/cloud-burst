'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  ImageIcon,
  Loader2,
  Clock,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { approveMedia, rejectMedia } from '@/app/protected/gallery/moderate/actions';
import { useToast } from '@/components/ui/use-toast';
import { getProxiedMediaUrl } from '@/lib/utils/media-proxy';
import { useBatchSelection } from '@/components/moderation/BatchSelectionProvider';
import { cn } from '@/lib/utils';

interface Media {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  event_name?: string;
  event_id: string;
  status: string;
}

interface EnhancedModerationCardProps {
  media: Media;
  onSuccess?: () => void;
  selectable?: boolean;
}

export function EnhancedModerationCard({ 
  media, 
  onSuccess,
  selectable = true
}: EnhancedModerationCardProps) {
  const { toast } = useToast();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get batch selection context if selectable
  const batchSelection = selectable ? useBatchSelection() : null;
  const isSelected = batchSelection?.isSelected(media.id) || false;
  
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

  // Get status badge based on media status
  const getStatusBadge = () => {
    switch (media.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Approved</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow w-full relative",
          isSelected && "ring-2 ring-primary/50 bg-primary/5"
        )}
      >
        {/* Selection checkbox */}
        {selectable && batchSelection && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => batchSelection.toggleSelection(media.id)}
              className="h-5 w-5 bg-white/80 backdrop-blur-sm border-muted-foreground"
            />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2 z-10">
          {getStatusBadge()}
        </div>
        
        <div 
          className="relative w-full aspect-square cursor-pointer"
          onClick={() => selectable && batchSelection?.toggleSelection(media.id)}
        >
          {(thumbnailUrl || mediaUrl) ? (
            <Image 
              src={thumbnailUrl || mediaUrl}
              alt={media.title || 'Media item'} 
              fill
              className={cn(
                "object-cover transition-transform hover:scale-105",
                isSelected && "opacity-90"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageIcon className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-medium text-lg mb-2 truncate">{media.title || 'Untitled'}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            From: {media.event_name || 'Unknown Event'}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Uploaded: {new Date(media.created_at).toLocaleDateString()}
          </p>
          
          {media.status === 'pending' && (
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
          )}
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
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Reason for rejection (required)
              </label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
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
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !reason.trim()}
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