"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useMediaStore } from "@/store/media-store";
import { Media } from "@/types/media";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaCard } from "./MediaCard";
import { Loader2, CheckCircle, XCircle, Ban } from "lucide-react";

interface MediaModerationGridProps {
  media: Media[];
  eventId: string;
  className?: string;
}

export function MediaModerationGrid({ media, eventId, className }: MediaModerationGridProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { approveMediaItem, rejectMediaItem, deleteMediaItem } = useMediaStore();

  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAction = async () => {
    if (!selectedMedia || !action) return;
    
    setIsProcessing(true);
    
    try {
      let result = false;
      
      switch (action) {
        case "approve":
          const approvedMedia = await approveMediaItem(selectedMedia.id, reason);
          result = !!approvedMedia;
          break;
        case "reject":
          const rejectedMedia = await rejectMediaItem(selectedMedia.id, reason);
          result = !!rejectedMedia;
          break;
        case "delete":
          result = await deleteMediaItem(selectedMedia.id);
          break;
      }
      
      if (result) {
        const actionVerb = action === "approve" ? "approved" : action === "reject" ? "rejected" : "deleted";
        toast({
          title: "Success",
          description: `The media has been ${actionVerb}.`,
        });
        
        // Refresh the page to update the list
        router.refresh();
      } else {
        throw new Error(`Failed to ${action} media`);
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      toast({
        title: "Error",
        description: `An error occurred while trying to ${action} the media.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedMedia(null);
      setAction(null);
      setReason("");
    }
  };
  
  const openActionDialog = (media: Media, actionType: "approve" | "reject" | "delete") => {
    setSelectedMedia(media);
    setAction(actionType);
  };
  
  return (
    <div className={className}>
      {media.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No media items to moderate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              showControls={true}
              onApprove={() => openActionDialog(item, "approve")}
              onReject={() => openActionDialog(item, "reject")} 
              onDelete={() => openActionDialog(item, "delete")}
            />
          ))}
        </div>
      )}
      
      {/* Action confirmation dialogs */}
      <AlertDialog open={!!selectedMedia && !!action} onOpenChange={() => { if (!isProcessing) { setSelectedMedia(null); setAction(null); setReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Approve Media" : action === "reject" ? "Reject Media" : "Delete Media"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve"
                ? "This will make the media visible to all event participants."
                : action === "reject"
                ? "This will reject the media and notify the uploader."
                : "This will permanently delete the media from the system. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {(action === "approve" || action === "reject") && (
            <div className="py-2">
              <Label htmlFor="reason">Optional reason (will be shared with uploader)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${action === "approve" ? "approval" : "rejection"}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : action === "reject"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {action === "approve" ? "Approving..." : action === "reject" ? "Rejecting..." : "Deleting..."}
                </>
              ) : (
                action === "approve" ? "Approve" : action === "reject" ? "Reject" : "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 