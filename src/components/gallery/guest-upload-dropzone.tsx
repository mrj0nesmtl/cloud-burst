"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, AlertCircle, FileVideo, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { uploadAndCreateMedia } from '@/lib/supabase/media'
import { formatFileSize } from '@/lib/utils'
import { MediaType } from '@/types/media'

interface GuestUploadDropzoneProps {
  eventId: string
  invitationToken: string
  onUploadComplete?: () => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: Record<string, string[]>
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
  type: 'image' | 'video'
}

export function GuestUploadDropzone({
  eventId,
  invitationToken,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.mov', '.webm']
  }
}: GuestUploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  
  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if we're already at max files
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload ${maxFiles} files at a time.`,
        variant: 'destructive'
      })
      return
    }
    
    // Create upload file objects
    const newFiles = acceptedFiles.map(file => {
      // Create preview for images and videos
      const preview = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      
      return {
        file,
        id: `${file.name}-${Date.now()}`,
        progress: 0,
        status: 'pending' as const,
        preview,
        type
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles, toast])
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles
  })
  
  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prev => {
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(file => file.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(file => file.id !== id)
    })
  }
  
  // Update file progress
  const updateFileProgress = (id: string, progress: number) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, progress } : file
      )
    )
  }
  
  // Update file status
  const updateFileStatus = (id: string, status: UploadFile['status'], error?: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, status, error } : file
      )
    )
  }
  
  // Start upload process
  const startUpload = async () => {
    if (files.length === 0 || isUploading) return
    
    setIsUploading(true)
    
    // Track completed uploads
    let completed = 0
    let hasErrors = false
    
    // Process each file
    for (const fileObj of files) {
      if (fileObj.status === 'success') {
        completed++
        continue
      }
      
      updateFileStatus(fileObj.id, 'uploading')
      
      try {
        // Update progress to show upload has started
        updateFileProgress(fileObj.id, 10)
        
        // Determine media type
        const mediaType = fileObj.type === 'image' ? MediaType.PHOTO : MediaType.VIDEO
        
        // Upload the file with invitation token in metadata
        const media = await uploadAndCreateMedia(
          fileObj.file,
          eventId,
          'auth.uid()', // This will be replaced by RLS with actual user ID or null for guests
          fileObj.file.name, // Use filename as title
          '', // No description
          true, // Is public
          mediaType,
          {
            invitation_token: invitationToken,
            original_filename: fileObj.file.name,
            upload_source: 'invitation'
          }
        )
        
        // Update progress to 100%
        updateFileProgress(fileObj.id, 100)
        updateFileStatus(fileObj.id, 'success')
        
        completed++
      } catch (error) {
        console.error('Error uploading file:', error)
        updateFileStatus(
          fileObj.id, 
          'error', 
          error instanceof Error ? error.message : 'Failed to upload file'
        )
        hasErrors = true
      }
    }
    
    setIsUploading(false)
    
    // Show toast based on result
    if (completed === files.length) {
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${completed} ${completed === 1 ? 'file' : 'files'}.`,
      })
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete()
      }
      
      // Clear the files list after a delay
      setTimeout(() => {
        setFiles([])
      }, 2000)
    } else if (hasErrors) {
      toast({
        title: 'Upload incomplete',
        description: `Uploaded ${completed} of ${files.length} files. Some files failed to upload.`,
        variant: 'destructive'
      })
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isUploading || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the files here...'
              : files.length >= maxFiles
              ? `Maximum ${maxFiles} files reached`
              : `Drag & drop photos and videos here, or click to select`}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF, WEBP, MP4, MOV files up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
      
      {/* Preview grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Files ({files.length}/{maxFiles})</div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={startUpload}
                disabled={isUploading || files.length === 0}
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => (
              <div key={file.id} className="relative border rounded-md overflow-hidden group">
                {/* File preview */}
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {file.preview ? (
                    file.type === 'image' ? (
                      <img 
                        src={file.preview} 
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video 
                          src={file.preview}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <FileVideo className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )
                  ) : (
                    file.type === 'image' ? (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    ) : (
                      <FileVideo className="h-8 w-8 text-muted-foreground/50" />
                    )
                  )}
                  
                  {/* Remove button */}
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* Upload progress */}
                  {file.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                  
                  {/* Success indicator */}
                  {file.status === 'success' && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  
                  {/* Error indicator */}
                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                      <div className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </div>
                    </div>
                  )}
                </div>
                
                {/* File info */}
                <div className="p-2 text-xs">
                  <p className="font-medium truncate">{file.file.name}</p>
                  <p className="text-muted-foreground">{formatFileSize(file.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 