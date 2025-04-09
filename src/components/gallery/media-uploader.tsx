'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, AlertCircle, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { cn, formatFileSize } from '@/lib/utils'

interface MediaUploaderProps {
  eventId: string
  onUploadComplete?: () => void
  maxFiles?: number
  maxSize?: number // in bytes
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

export function MediaUploader({
  eventId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
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
        type: type as 'image' | 'video'
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles, toast])
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm']
    },
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
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to upload files.',
        variant: 'destructive'
      })
      setIsUploading(false)
      return
    }
    
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
        
        // Generate unique filename
        const fileExt = fileObj.file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `events/${eventId}/${fileName}`
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) throw uploadError
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath)
        
        // Create a database record for the uploaded file
        const { error: dbError } = await supabase
          .from('gallery_photos')
          .insert({
            event_id: eventId,
            url: publicUrl,
            thumbnail_url: publicUrl, // Using same URL for thumbnail for now
            caption: fileObj.file.name,
            tags: [],
            storage_path: filePath,
            status: 'pending', // Needs approval if moderation is enabled
            uploaded_by: user.id,
            width: 0, // Would need to get actual dimensions
            height: 0, // Would need to get actual dimensions
            size: fileObj.file.size
          })
        
        if (dbError) throw dbError
        
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
  
  // Clear all files
  const clearFiles = () => {
    // Clean up object URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }
  
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          (isUploading || files.length >= maxFiles) && "opacity-50 cursor-not-allowed"
        )}
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
                onClick={clearFiles}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={startUpload}
                disabled={isUploading || files.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload All'
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map(file => (
              <div key={file.id} className="relative rounded-md overflow-hidden border bg-card">
                {/* Preview */}
                <div className="relative aspect-square">
                  {file.type === 'image' ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-full w-full object-cover"
                      onLoad={() => {
                        // Free memory when the image is loaded
                        if (file.status === 'success') {
                          URL.revokeObjectURL(file.preview || '')
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <FileVideo className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status overlay */}
                  {file.status === 'uploading' && (
                    <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center p-2">
                      <Progress value={file.progress} className="w-4/5 h-2" />
                      <span className="text-xs mt-1">{file.progress}%</span>
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                      <div className="bg-destructive text-destructive-foreground rounded-md p-2 max-w-[90%]">
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Error</span>
                        </div>
                        {file.error && <p className="text-xs mt-1 line-clamp-2">{file.error}</p>}
                      </div>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  {file.status !== 'uploading' && (
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                      onClick={e => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* File info */}
                <div className="p-2 text-xs truncate">
                  <p className="font-medium truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                  <p className="text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 