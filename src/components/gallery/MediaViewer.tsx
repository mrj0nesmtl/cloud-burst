import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaItem } from "./MediaCard";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share, 
  Heart, 
  MessageSquare,
  Play,
  Pause
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MediaViewerProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  showComments?: boolean;
  onAddComment?: (mediaId: string, comment: string) => void;
  onLike?: (mediaId: string) => void;
}

export function MediaViewer({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  showComments = false,
  onAddComment,
  onLike
}: MediaViewerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  
  const currentItem = items[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike && currentItem) {
      onLike(currentItem.id);
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newComment.trim() && onAddComment && currentItem) {
      onAddComment(currentItem.id, newComment);
      setNewComment("");
    }
  };
  
  const handleVideoPlayToggle = () => {
    if (!videoEl) return;
    
    if (isVideoPlaying) {
      videoEl.pause();
    } else {
      videoEl.play();
    }
    
    setIsVideoPlaying(!isVideoPlaying);
  };
  
  // Set up video event listeners
  useEffect(() => {
    if (!videoEl) return;
    
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    const handleEnded = () => setIsVideoPlaying(false);
    
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);
    
    return () => {
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [videoEl]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose]);
  
  // Reset video playing state when changing items
  useEffect(() => {
    setIsVideoPlaying(false);
  }, [currentIndex]);
  
  if (!currentItem) return null;
  
  const isVideo = currentItem.media_type === 'video';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Media display area */}
          <div className="relative flex-1 bg-black flex items-center justify-center">
            {isVideo ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={(el) => setVideoEl(el)}
                  src={currentItem.url}
                  className="max-h-full max-w-full"
                  controls={false}
                  playsInline
                />
                <button
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent"
                  onClick={handleVideoPlayToggle}
                >
                  {!isVideoPlaying && (
                    <div className="bg-black/50 rounded-full p-4">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <img
                src={currentItem.url}
                alt={currentItem.title || 'Image'}
                className="max-h-full max-w-full object-contain"
              />
            )}
            
            {/* Navigation controls */}
            <div className="absolute top-2 right-2 z-10">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-black/70">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handleNext}
              disabled={currentIndex === items.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            
            {/* Media info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-xl font-semibold">{currentItem.title || 'Untitled'}</h2>
              <p className="opacity-80 text-sm">{formatDate(currentItem.created_at)}</p>
            </div>
          </div>
          
          {/* Comments panel (conditionally shown) */}
          {showComments && showCommentsPanel && (
            <div className="w-full md:w-[350px] border-l overflow-y-auto bg-background">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Comments</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => setShowCommentsPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {currentItem.comments && currentItem.comments.length > 0 ? (
                    <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
                      {currentItem.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            {comment.author.avatarUrl && (
                              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                            )}
                            <AvatarFallback>{comment.author.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium">{comment.author.name}</p>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p>No comments yet</p>
                      <p className="text-sm mt-1">Be the first to comment</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-auto pt-4">
                    <Input 
                      className="flex-1" 
                      placeholder="Add a comment..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="submit" disabled={!newComment.trim()}>Post</Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={isLiked ? "fill-red-500" : ""} />
            </Button>
            
            {showComments && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
              >
                <MessageSquare />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
              // Download logic
              const a = document.createElement('a');
              a.href = currentItem.url;
              a.download = currentItem.title || 'download';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => {
              // Share logic
              if (navigator.share) {
                navigator.share({
                  title: currentItem.title || 'Shared media',
                  url: currentItem.url
                });
              } else {
                // Fallback - copy link to clipboard
                navigator.clipboard.writeText(currentItem.url);
                // You'd typically show a toast notification here
              }
            }}>
              <Share />
            </Button>
          </div>
        </div>
        
        {/* Video playback controls for videos */}
        {isVideo && videoEl && (
          <div className="absolute bottom-16 left-0 right-0 p-2 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-2 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={handleVideoPlayToggle}
              >
                {isVideoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              {/* You could add a progress bar and other video controls here */}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 