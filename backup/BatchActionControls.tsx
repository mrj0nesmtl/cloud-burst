'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  CheckSquare,
  Square,
  Loader2,
  ListFilter,
  ArrowDownUp,
  SlidersHorizontal 
} from 'lucide-react';
import { useBatchSelection } from './BatchSelectionProvider';
import { batchApproveMedia, batchRejectMedia } from '@/app/protected/gallery/moderate/batch-actions';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface BatchActionControlsProps {
  mediaItems: { id: string }[];
  onActionComplete: () => void;
}

export function BatchActionControls({ mediaItems, onActionComplete }: BatchActionControlsProps) {
  const { toast } = useToast();
  const { selectedIds, selectAll, deselectAll, selectedCount } = useBatchSelection();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [filterEvent, setFilterEvent] = useState<string>('all');

  const allSelected = selectedCount === mediaItems.length;
  const someSelected = selectedCount > 0 && selectedCount < mediaItems.length;
  
  const handleSelectAllToggle = () => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll(mediaItems.map(item => item.id));
    }
  };
  
  const handleBatchApprove = async () => {
    if (selectedCount === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one media item to approve.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedIdsArray = Array.from(selectedIds);
      const result = await batchApproveMedia(selectedIdsArray, reason);
      
      if (result.success) {
        toast({
          title: 'Batch approval complete',
          description: `Successfully approved ${result.count} media items.`,
        });
        setIsApproveDialogOpen(false);
        deselectAll();
        onActionComplete();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to process batch approval',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in batch approval:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBatchReject = async () => {
    if (selectedCount === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one media item to reject.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for rejecting these media items.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedIdsArray = Array.from(selectedIds);
      const result = await batchRejectMedia(selectedIdsArray, reason);
      
      if (result.success) {
        toast({
          title: 'Batch rejection complete',
          description: `Successfully rejected ${result.count} media items.`,
        });
        setIsRejectDialogOpen(false);
        deselectAll();
        onActionComplete();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to process batch rejection',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in batch rejection:', error);
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
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleSelectAllToggle}
          >
            {allSelected ? (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                {someSelected ? 'Select All' : 'Select All'}
              </>
            )}
          </Button>
          
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9 w-[160px]">
              <ArrowDownUp className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="event">By event</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterEvent} onValueChange={setFilterEvent}>
            <SelectTrigger className="h-9 w-[160px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {/* Event items would be dynamically generated here */}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="h-9">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>
      
      {selectedCount > 0 && (
        <div className="bg-muted/30 border rounded-lg p-3 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-200"
              onClick={() => setIsApproveDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-red-200"
              onClick={() => setIsRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}
      
      {/* Batch Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Selected Media</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedCount} selected media item{selectedCount !== 1 ? 's' : ''}.
              This will make them visible in the gallery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="batch-reason" className="text-sm font-medium">
                Optional note (will be visible to uploaders)
              </label>
              <Textarea
                id="batch-reason"
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
              onClick={handleBatchApprove}
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
                  Approve {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Selected Media</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedCount} selected media item{selectedCount !== 1 ? 's' : ''}.
              They will not be visible in the gallery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="batch-rejection-reason" className="text-sm font-medium">
                Reason for rejection (required)
              </label>
              <Textarea
                id="batch-rejection-reason"
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
              onClick={handleBatchReject}
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
                  Reject {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 