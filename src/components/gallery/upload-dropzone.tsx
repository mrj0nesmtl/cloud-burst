"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { uploadAndCreatePhoto } from '@/lib/supabase/photos'
import { formatFileSize } from '@/lib/utils'
import { usePhotosStore } from '@/store/photos-store'

interface UploadDropzoneProps {
  eventId: string
  onUploadComplete?: () => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function UploadDropzone({
  eventId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { setIsUploading: setStoreUploading, setUploadProgress, setUploadError } = usePhotosStore()
  
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
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}`,
      progress: 0,
      status: 'pending' as const
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles, toast])
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles
  })
  
  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }
  
  // Update file progress
  const updateFileProgress = (id: string, progress: number) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, progress } : file
      )
    )
    
    // Update global upload progress (average of all files)
    const totalProgress = files.reduce((sum, file) => {
      return sum + (file.id === id ? progress : file.progress)
    }, 0) / files.length
    
    setUploadProgress(totalProgress)
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
    setStoreUploading(true)
    setUploadError(null)
    
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
        // Simulate progress updates (since we don't have real progress from Supabase)
        const progressInterval = setInterval(() => {
          const randomIncrement = Math.random() * 20
          updateFileProgress(fileObj.id, Math.min(fileObj.progress + randomIncrement, 90))
        }, 500)
        
        // Upload the file
        await uploadAndCreatePhoto(eventId, fileObj.file)
        
        // Clear interval and set to 100%
        clearInterval(progressInterval)
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
    setStoreUploading(false)
    
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
      
      setUploadError(new Error('Some files failed to upload'))
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
              : `Drag & drop photos here, or click to select`}
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')} files up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Files ({files.length}/{maxFiles})</div>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center space-x-2 text-sm border rounded-md p-2">
                <div className="flex-1 truncate">
                  {file.file.name} ({formatFileSize(file.file.size)})
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {file.status === 'uploading' && (
                    <div className="w-20">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center space-x-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">{file.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload button */}
      {files.length > 0 && (
        <Button
          onClick={startUpload}
          disabled={isUploading || files.every(f => f.status === 'success')}
          className="w-full"
        >
          {isUploading
            ? `Uploading (${Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)}%)`
            : files.every(f => f.status === 'success')
            ? 'Upload Complete'
            : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
        </Button>
      )}
    </div>
  )
} 