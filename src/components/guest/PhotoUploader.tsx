'use client'

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { X, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'

interface PhotoUploaderProps {
  eventId: string
  invitationToken: string
  maxFiles?: number
}

interface UploadingFile {
  id: string
  file: File
  preview: string
  progress: number
  error?: string
  uploaded?: boolean
  path?: string
}

export function PhotoUploader({ eventId, invitationToken, maxFiles = 10 }: PhotoUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview thumbnails and setup file objects
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }))

    // Add to existing files, but limit to maxFiles
    setUploadingFiles(prev => {
      const combined = [...prev, ...newFiles]
      return combined.slice(0, maxFiles)
    })
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif']
    },
    maxFiles: maxFiles,
    maxSize: 20 * 1024 * 1024, // 20MB
  })

  const removeFile = (id: string) => {
    setUploadingFiles(prev => {
      const filtered = prev.filter(file => file.id !== id)
      
      // Revoke the data URI to avoid memory leaks
      const fileToRemove = prev.find(file => file.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      
      return filtered
    })
  }

  const uploadFiles = async () => {
    if (uploadingFiles.length === 0 || isUploading) return
    
    setIsUploading(true)

    // Upload each file
    for (const fileObj of uploadingFiles) {
      if (fileObj.uploaded) continue

      try {
        // Update progress to show we're starting
        updateFileProgress(fileObj.id, 10)

        // Prepare file path - use a nested structure for better organization
        const fileName = `${Date.now()}-${fileObj.file.name.replace(/[^a-zA-Z0-9-.]/g, '_')}`
        const filePath = `events/${eventId}/uploads/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('event-photos')
          .upload(filePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // Update progress to 90% - we still need to save the record
        updateFileProgress(fileObj.id, 90)

        // Record the upload in the database
        const { error: dbError } = await supabase
          .from('event_photos')
          .insert({
            event_id: eventId,
            storage_path: filePath,
            uploaded_by_token: invitationToken,
            filename: fileObj.file.name,
            file_size: fileObj.file.size,
            content_type: fileObj.file.type,
            status: 'uploaded',
          })

        if (dbError) throw dbError

        // Mark as completed
        setUploadingFiles(prev => 
          prev.map(file => 
            file.id === fileObj.id
            ? { ...file, progress: 100, uploaded: true, path: filePath }
            : file
          )
        )
      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => 
          prev.map(file => 
            file.id === fileObj.id
            ? { ...file, error: 'Upload failed' }
            : file
          )
        )
      }
    }

    // Check if all files were uploaded
    const allUploaded = uploadingFiles.every(file => file.uploaded || file.error)
    if (allUploaded) {
      toast({
        title: 'Upload complete',
        description: 'All photos have been uploaded successfully.',
      })
    } else {
      const errorCount = uploadingFiles.filter(file => file.error).length
      if (errorCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Upload issues',
          description: `${errorCount} photos failed to upload. Please try again.`,
        })
      }
    }

    setIsUploading(false)
  }

  const updateFileProgress = (id: string, progress: number) => {
    setUploadingFiles(prev => 
      prev.map(file => 
        file.id === id
        ? { ...file, progress }
        : file
      )
    )
  }

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop your photos here' : 'Drag & drop photos here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to select files (max {maxFiles} photos, 20MB each)
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Photos ({uploadingFiles.length})</h3>
            <Button 
              onClick={uploadFiles} 
              disabled={isUploading || uploadingFiles.every(file => file.uploaded)}
            >
              {isUploading ? 'Uploading...' : 'Upload All Photos'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadingFiles.map((file) => (
              <div key={file.id} className="relative bg-muted rounded-lg overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="object-cover w-full h-full"
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                  />
                  
                  {/* Status indicators */}
                  {file.uploaded && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                    </div>
                  )}
                  
                  {file.error && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <span className="text-sm font-medium">{file.error}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                {!file.uploaded && !file.error && file.progress > 0 && (
                  <div className="px-3 py-2">
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}
                
                {/* File info */}
                <div className="px-3 py-2 flex items-center justify-between text-sm">
                  <div className="truncate flex-1">
                    <span className="font-medium">{file.file.name}</span>
                  </div>
                  
                  {/* Remove button (only if not uploading) */}
                  {!isUploading && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoUploader 