"use client"

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useMediaStore } from '@/store/media-store';
import { Media, MediaType, MediaUploadProgress } from '@/types/media';
import { CheckCircle, XCircle, X, Upload, Image, Video } from 'lucide-react';
import { formatFileSize } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  eventId: string;
  userId: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onUploadComplete?: (media: Media) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export function MediaUploader({
  eventId,
  userId,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'],
  onUploadComplete,
  onUploadError,
  className
}: MediaUploaderProps) {
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const uploadMediaFile = useMediaStore(state => state.uploadMediaFile);
  const uploadProgress = useMediaStore(state => state.uploadProgress);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejected: any[]) => {
      // Handle rejected files
      if (rejected.length > 0) {
        const rejectedFilesArray = rejected.map(rejection => rejection.file);
        setRejectedFiles(prev => [...prev, ...rejectedFilesArray]);
        
        rejected.forEach(rejection => {
          const reasons = rejection.errors.map((error: any) => error.message).join(', ');
          toast.error(`${rejection.file.name} was rejected: ${reasons}`);
        });
      }
      
      // Handle accepted files
      for (const file of acceptedFiles) {
        try {
          const media = await uploadMediaFile(file, eventId, userId);
          
          if (media) {
            onUploadComplete?.(media);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          const err = error instanceof Error ? error : new Error('Unknown upload error');
          onUploadError?.(err);
          toast.error(`Failed to upload ${file.name}: ${err.message}`);
        }
      }
    },
    [eventId, userId, uploadMediaFile, onUploadComplete, onUploadError]
  );
  
  const removeRejectedFile = (file: File) => {
    setRejectedFiles(prev => prev.filter(f => f !== file));
  };
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': allowedTypes.filter(type => type.startsWith('image/')),
      'video/*': allowedTypes.filter(type => type.startsWith('video/'))
    },
    maxFiles,
    maxSize,
    multiple: true
  });
  
  // Clear rejected files after 5 seconds
  useEffect(() => {
    if (rejectedFiles.length > 0) {
      const timeout = setTimeout(() => {
        setRejectedFiles([]);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [rejectedFiles]);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Upload Media</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer text-center flex flex-col items-center justify-center gap-3",
            isDragActive && "border-primary/70 bg-primary/5",
            isDragAccept && "border-green-500/70 bg-green-500/5",
            isDragReject && "border-red-500/70 bg-red-500/5",
            !isDragActive && "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50"
          )}
          style={{ minHeight: '150px' }}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-1">
            <p className="text-base font-medium">
              {isDragActive
                ? isDragAccept
                  ? "Drop files to upload"
                  : "Some files won't be accepted"
                : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              <span>Images</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>Videos</span>
            </div>
            <span>up to {formatFileSize(maxSize)}</span>
          </div>
        </div>
        
        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium">Uploads</h4>
            {uploadProgress.map(upload => (
              <UploadProgressItem 
                key={upload.id} 
                upload={upload} 
              />
            ))}
          </div>
        )}
        
        {/* Rejected Files */}
        {rejectedFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-red-500">Rejected Files</h4>
            {rejectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-red-50 p-2 rounded-md">
                <div className="flex items-center space-x-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => removeRejectedFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Supported formats: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
      </CardFooter>
    </Card>
  );
}

interface UploadProgressItemProps {
  upload: MediaUploadProgress;
}

function UploadProgressItem({ upload }: UploadProgressItemProps) {
  const { file, progress, status, error } = upload;
  
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return (
          file.type.startsWith('image/') 
            ? <Image className="h-4 w-4 text-blue-500" />
            : <Video className="h-4 w-4 text-purple-500" />
        );
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 truncate">
          {getStatusIcon()}
          <span className="truncate max-w-[200px]">{file.name}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>
        <span className="text-xs font-medium">
          {status === 'complete' 
            ? 'Complete'
            : status === 'error'
              ? 'Failed'
              : `${Math.round(progress)}%`
          }
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className={cn(
          "h-1",
          status === 'complete' ? "bg-green-100 data-[value]:bg-green-500" : 
          status === 'error' ? "bg-red-100 data-[value]:bg-red-500" : 
          "bg-blue-100 data-[value]:bg-blue-500"
        )}
      />
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 