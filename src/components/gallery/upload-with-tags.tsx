"use client"

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, AlertCircle, Tag, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { uploadAndCreatePhotoWithTags } from '@/app/lib/photos'
import { formatFileSize } from '@/lib/utils'
import { usePhotosStore } from '@/store/photos-store'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'

interface UploadWithTagsProps {
  eventId: string
  onUploadComplete?: () => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  suggestedTags?: string[] // Optional pre-defined tags
}

type UploadFile = {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  tags: string[]
}

export function UploadWithTags({
  eventId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  suggestedTags = []
}: UploadWithTagsProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
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
      status: 'pending' as const,
      tags: []
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
  
  // Open tag dialog for a file
  const openTagDialog = (id: string) => {
    const file = files.find(f => f.id === id)
    if (file) {
      setCurrentTags(file.tags)
      setSelectedFileId(id)
      setTagDialogOpen(true)
    }
  }
  
  // Save tags for a file
  const saveTags = () => {
    if (selectedFileId) {
      setFiles(prev => 
        prev.map(file => 
          file.id === selectedFileId ? { ...file, tags: currentTags } : file
        )
      )
      setTagDialogOpen(false)
      setSelectedFileId(null)
    }
  }
  
  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }
  
  // Remove a tag
  const removeTag = (tag: string) => {
    setCurrentTags(prev => prev.filter(t => t !== tag))
  }
  
  // Add a suggested tag
  const addSuggestedTag = (tag: string) => {
    if (!currentTags.includes(tag)) {
      setCurrentTags(prev => [...prev, tag])
    }
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
        
        // Upload the file with tags
        await uploadAndCreatePhotoWithTags(
          eventId, 
          fileObj.file, 
          { tags: fileObj.tags }
        )
        
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
    
    // Show toast notification
    if (hasErrors) {
      toast({
        title: 'Upload completed with errors',
        description: `${completed} of ${files.length} files were uploaded successfully.`,
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Upload complete',
        description: `${completed} ${completed === 1 ? 'file' : 'files'} uploaded successfully.`,
      })
      
      // Clear the file list if all uploads were successful
      setFiles([])
      
      // Call the onUploadComplete callback
      if (onUploadComplete) {
        onUploadComplete()
      }
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}
          ${isUploading || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Drag & drop photos here</h3>
          <p className="text-sm text-muted-foreground">
            or click to select files
            {files.length >= maxFiles && ' (max files reached)'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Accepted formats: {acceptedFileTypes.join(', ')} · Max size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
      
      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            {files.length} {files.length === 1 ? 'file' : 'files'} selected
          </h3>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center gap-3 p-3 border rounded-md bg-card"
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                  {file.file.type.startsWith('image/') && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={file.file.name}
                      className="h-full w-full object-cover"
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file.file))}
                    />
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file.size)}</span>
                    
                    {/* Tags */}
                    {file.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{file.tags.length} {file.tags.length === 1 ? 'tag' : 'tags'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress bar for uploading files */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                  
                  {/* Error message */}
                  {file.status === 'error' && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {file.error || 'Upload failed'}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Tag button */}
                  {file.status !== 'uploading' && file.status !== 'success' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openTagDialog(file.id)
                      }}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Status indicator or remove button */}
                  {file.status === 'success' ? (
                    <div className="h-8 w-8 flex items-center justify-center text-green-500">
                      <Check className="h-5 w-5" />
                    </div>
                  ) : file.status === 'uploading' ? (
                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                      <span className="text-xs">{Math.round(file.progress)}%</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <Button
            onClick={startUpload}
            disabled={isUploading || files.every(f => f.status === 'success')}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
      
      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Add new tag */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Current tags */}
            <div className="flex flex-wrap gap-2">
              {currentTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {currentTags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags added yet</p>
              )}
            </div>
            
            {/* Suggested tags */}
            {suggestedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${currentTags.includes(tag) ? 'bg-primary/10' : ''}`}
                      onClick={() => addSuggestedTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTags}>
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
