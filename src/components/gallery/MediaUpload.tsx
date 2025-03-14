"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileIcon, Check, AlertCircle, Image, Film } from 'lucide-react'

import { MediaType } from '@/types/media'
import { useMediaStore } from '@/store/media-store'
import { cn } from '@/lib/utils'
import { uploadAndCreateMedia } from '@/lib/supabase/media'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'

interface MediaUploadProps {
  eventId: string
  userId: string
  onUploadComplete?: () => void
  acceptedMediaTypes?: MediaType[]
  maxFileSizeMB?: number
  maxFiles?: number
  className?: string
  showProgress?: boolean
}

/**
 * MediaUpload component with drag and drop support
 */
export function MediaUpload({
  eventId,
  userId,
  onUploadComplete,
  acceptedMediaTypes = ['photo', 'video'],
  maxFileSizeMB = 50,
  maxFiles = 100,
  className,
  showProgress = true
}: MediaUploadProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Get upload state and actions from store
  const { 
    uploads,
    addUpload,
    updateUploadProgress,
    setUploadStatus,
    removeUpload,
    clearUploads
  } = useMediaStore()
  
  // Convert accepted media types to file accept patterns
  const getAcceptedFileTypes = useCallback(() => {
    const acceptMap: Record<string, string[]> = {
      photo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/quicktime']
    };
    
    const result: Record<string, string[]> = {};
    
    acceptedMediaTypes.forEach(type => {
      if (acceptMap[type]) {
        acceptMap[type].forEach(mimeType => {
          const category = mimeType.split('/')[0];
          if (!result[category]) {
            result[category] = [];
          }
          result[category].push(mimeType);
        });
      }
    });
    
    return result;
  }, [acceptedMediaTypes]);
  
  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Clear any previous errors
    setUploadError(null);
    
    // Check if exceeding max files
    if (Object.keys(uploads).length + acceptedFiles.length > maxFiles) {
      setUploadError(`Cannot upload more than ${maxFiles} files at once.`);
      return;
    }
    
    // Process each file
    for (const file of acceptedFiles) {
      try {
        // Check file size
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          setUploadError(`File "${file.name}" exceeds the maximum size of ${maxFileSizeMB}MB.`);
          continue;
        }
        
        // Add to upload queue
        const uploadId = addUpload(file);
        
        // Determine media type from mime type
        const mediaType: MediaType = file.type.startsWith('image/') ? 'photo' : 'video';
        
        // Set upload as in progress
        setUploadStatus(uploadId, 'uploading');
        
        // Perform the upload with progress tracking
        const uploadProgress = (progress: number) => {
          updateUploadProgress(uploadId, progress);
        };
        
        // For simplicity, simulate progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress > 90) {
            clearInterval(progressInterval);
            progress = 90; // Hold at 90% until complete
          }
          uploadProgress(progress);
        }, 300);
        
        // Upload the file
        const media = await uploadAndCreateMedia(
          file,
          eventId,
          userId,
          mediaType
        );
        
        clearInterval(progressInterval);
        
        if (media) {
          // Upload succeeded
          updateUploadProgress(uploadId, 100);
          setUploadStatus(uploadId, 'success', undefined, media.id);
          
          // Notify parent of successful upload
          if (onUploadComplete) {
            onUploadComplete();
          }
        } else {
          // Upload failed
          setUploadStatus(uploadId, 'error', 'Failed to upload file');
        }
      } catch (error) {
        setUploadError(`Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [eventId, userId, maxFileSizeMB, maxFiles, uploads, addUpload, updateUploadProgress, setUploadStatus, onUploadComplete]);
  
  // Configure dropzone
  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxSize: maxFileSizeMB * 1024 * 1024,
    maxFiles
  });
  
  // Get upload items
  const uploadItems = Object.entries(uploads).map(([id, upload]) => ({
    id,
    ...upload
  }));
  
  // Count uploads by status
  const pendingUploads = uploadItems.filter(item => item.status === 'pending').length;
  const uploadingUploads = uploadItems.filter(item => item.status === 'uploading').length;
  const successUploads = uploadItems.filter(item => item.status === 'success').length;
  const errorUploads = uploadItems.filter(item => item.status === 'error').length;
  
  // Clear completed uploads
  const handleClearCompleted = () => {
    uploadItems.forEach(item => {
      if (item.status === 'success' || item.status === 'error') {
        removeUpload(item.id);
      }
    });
  };
  
  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (file.type.startsWith('video/')) {
      return <Film className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };
  
  // Get upload status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isDragAccept && "border-green-500 bg-green-50 dark:bg-green-950/20",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
          "hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground p-4">
          <Upload className="h-10 w-10 mb-2" />
          <p className="text-base font-medium">
            {isDragActive
              ? isDragAccept
                ? "Drop files to upload"
                : "This file type is not accepted"
              : "Drag and drop files here or click to browse"}
          </p>
          <p className="text-sm">
            Upload {acceptedMediaTypes.join(' or ')} files 
            {maxFileSizeMB ? ` (max ${maxFileSizeMB}MB each)` : ''}
          </p>
        </div>
      </div>
      
      {/* Error display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {/* Upload queue */}
      {showProgress && uploadItems.length > 0 && (
        <div className="border rounded-lg">
          <div className="p-3 flex items-center justify-between border-b">
            <div className="flex space-x-2">
              <Badge variant="outline">{uploadItems.length} Files</Badge>
              {pendingUploads > 0 && <Badge variant="outline">{pendingUploads} Pending</Badge>}
              {uploadingUploads > 0 && <Badge variant="outline">{uploadingUploads} Uploading</Badge>}
              {successUploads > 0 && <Badge variant="success">{successUploads} Completed</Badge>}
              {errorUploads > 0 && <Badge variant="destructive">{errorUploads} Failed</Badge>}
            </div>
            <div className="flex space-x-2">
              {(successUploads > 0 || errorUploads > 0) && (
                <Button size="sm" variant="ghost" onClick={handleClearCompleted}>
                  Clear Completed
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={clearUploads}>
                Clear All
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-60">
            <div className="p-2 space-y-2">
              {uploadItems.map((item) => (
                <div key={item.id} className="border rounded-md p-3 flex items-start space-x-3">
                  <div className="shrink-0 p-2 bg-muted rounded">
                    {getFileIcon(item.file)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => removeUpload(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB • 
                        {item.status === 'pending' && ' Pending'}
                        {item.status === 'uploading' && ' Uploading...'}
                        {item.status === 'success' && ' Completed'}
                        {item.status === 'error' && ` Error: ${item.error || 'Upload failed'}`}
                      </div>
                      <div className="text-xs font-medium">
                        {item.progress.toFixed(0)}%
                      </div>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
} 