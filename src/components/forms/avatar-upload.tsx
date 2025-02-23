'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/ui/icons'
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onUpload: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUpload(publicUrl)
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your avatar.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentAvatarUrl || ''} />
        <AvatarFallback>
          <Icons.user className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      <Button
        variant="outline"
        disabled={isUploading}
        className="relative"
      >
        {isUploading ? 'Uploading...' : 'Change Avatar'}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </Button>
    </div>
  )
} 