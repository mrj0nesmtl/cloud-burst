"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Gallery, GallerySettings } from '@/types/gallery'
import { updateGallerySettings } from '@/lib/supabase/galleries'
import { Label } from '../ui/label'

const gallerySettingsSchema = z.object({
  layout: z.enum(['grid', 'masonry', 'slideshow']),
  allowUploads: z.boolean(),
  requireApproval: z.boolean(),
  maxUploadSize: z.coerce.number().min(1).max(50),
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
})

type GallerySettingsFormValues = z.infer<typeof gallerySettingsSchema>

interface GallerySettingsFormProps {
  gallery: Gallery
}

export function GallerySettingsForm({ gallery }: GallerySettingsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Extract the existing settings
  const existingSettings = gallery.settings || {
    layout: 'grid',
    allowUploads: true,
    requireApproval: true,
    maxUploadSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
  
  // Convert maxUploadSize from bytes to MB for the form
  const maxUploadSizeMB = Math.round((existingSettings.maxUploadSize || 10 * 1024 * 1024) / (1024 * 1024))
  
  const form = useForm<GallerySettingsFormValues>({
    resolver: zodResolver(gallerySettingsSchema),
    defaultValues: {
      layout: existingSettings.layout || 'grid',
      allowUploads: existingSettings.allowUploads ?? true,
      requireApproval: existingSettings.requireApproval ?? true,
      maxUploadSize: maxUploadSizeMB,
      allowedTypes: existingSettings.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
  })
  
  const onSubmit = async (data: GallerySettingsFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Convert maxUploadSize back to bytes
      const settingsToUpdate: Partial<GallerySettings> = {
        ...data,
        maxUploadSize: data.maxUploadSize * 1024 * 1024 // Convert MB to bytes
      }
      
      await updateGallerySettings(gallery.id, settingsToUpdate)
      
      toast.success('Gallery settings updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating gallery settings:', error)
      toast.error('Failed to update gallery settings')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="layout"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Gallery Layout</FormLabel>
              <FormDescription>
                Choose how photos are displayed in your gallery
              </FormDescription>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-3 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem
                    value="grid"
                    id="grid"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="grid"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="bg-muted-foreground/20 rounded-sm w-12 h-12"></div>
                      <div className="bg-muted-foreground/20 rounded-sm w-12 h-12"></div>
                      <div className="bg-muted-foreground/20 rounded-sm w-12 h-12"></div>
                      <div className="bg-muted-foreground/20 rounded-sm w-12 h-12"></div>
                    </div>
                    <span className="text-center">Grid</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="masonry"
                    id="masonry"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="masonry"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="flex flex-col gap-1">
                        <div className="bg-muted-foreground/20 rounded-sm w-12 h-8"></div>
                        <div className="bg-muted-foreground/20 rounded-sm w-12 h-16"></div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="bg-muted-foreground/20 rounded-sm w-12 h-16"></div>
                        <div className="bg-muted-foreground/20 rounded-sm w-12 h-8"></div>
                      </div>
                    </div>
                    <span className="text-center">Masonry</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="slideshow"
                    id="slideshow"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="slideshow"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="relative mb-2">
                      <div className="bg-muted-foreground/20 rounded-sm w-24 h-16"></div>
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <div className="bg-background/80 rounded-full w-4 h-4 ml-1 flex items-center justify-center">
                          <div className="border-l-2 border-muted-foreground h-2 rotate-180"></div>
                        </div>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="bg-background/80 rounded-full w-4 h-4 mr-1 flex items-center justify-center">
                          <div className="border-r-2 border-muted-foreground h-2"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-center">Slideshow</span>
                  </Label>
                </div>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="allowUploads"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Allow Uploads</FormLabel>
                  <FormDescription>
                    Let attendees upload photos to your gallery
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requireApproval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Approval</FormLabel>
                  <FormDescription>
                    Review uploads before they appear in the gallery
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="maxUploadSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Upload Size (MB)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maximum file size for uploads (1-50 MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </Form>
  )
} 