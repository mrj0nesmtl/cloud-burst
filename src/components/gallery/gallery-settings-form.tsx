"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Save, Loader2, Layout, Upload, Shield, FileType, MoreHorizontal, Grid, Columns, Presentation } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Gallery, GallerySettings } from '@/types/gallery'
import { updateGallerySettings } from '@/lib/supabase/galleries'
import { Label } from '../ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

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
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect viewport size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
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
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Layout Section */}
          <Card style={{ 
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            background: 'var(--background)',
            overflow: 'hidden'
          }}>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Layout className="h-5 w-5 text-primary" />
                <h3 className="text-base font-medium">Gallery Display</h3>
              </div>
              
              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormDescription>
                      Choose how photos are displayed in your gallery
                    </FormDescription>
                    <div className="grid grid-cols-1 gap-y-6 pt-2">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        {/* Grid option */}
                        <div className="relative">
                          <RadioGroupItem
                            value="grid"
                            id="grid"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="grid"
                            className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent/5 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="rounded-md bg-primary/10 p-2">
                              <Grid className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium mb-1">Grid Layout</div>
                                {field.value === 'grid' && (
                                  <div className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    Selected
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Classic grid view with equal-sized thumbnails. Great for consistent layouts.
                              </div>
                              <div className="mt-3 grid grid-cols-4 gap-1">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="aspect-square rounded-sm bg-muted-foreground/20" />
                                ))}
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        {/* Masonry option */}
                        <div className="relative">
                          <RadioGroupItem
                            value="masonry"
                            id="masonry"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="masonry"
                            className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent/5 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="rounded-md bg-primary/10 p-2">
                              <Columns className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium mb-1">Masonry Layout</div>
                                {field.value === 'masonry' && (
                                  <div className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    Selected
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Pinterest-style layout with varied heights. Best for mixed aspect ratios.
                              </div>
                              <div className="mt-3 flex gap-1">
                                <div className="w-1/3 flex flex-col gap-1">
                                  <div className="aspect-[1/1.2] rounded-sm bg-muted-foreground/20" />
                                  <div className="aspect-square rounded-sm bg-muted-foreground/20" />
                                </div>
                                <div className="w-1/3 flex flex-col gap-1">
                                  <div className="aspect-square rounded-sm bg-muted-foreground/20" />
                                  <div className="aspect-[1/1.5] rounded-sm bg-muted-foreground/20" />
                                </div>
                                <div className="w-1/3 flex flex-col gap-1">
                                  <div className="aspect-[1/1.3] rounded-sm bg-muted-foreground/20" />
                                  <div className="aspect-[1/0.8] rounded-sm bg-muted-foreground/20" />
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        {/* Slideshow option */}
                        <div className="relative">
                          <RadioGroupItem
                            value="slideshow"
                            id="slideshow"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="slideshow"
                            className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent/5 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="rounded-md bg-primary/10 p-2">
                              <Presentation className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium mb-1">Slideshow / Swipe</div>
                                {field.value === 'slideshow' && (
                                  <div className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    Selected
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Full-screen swipeable presentation. Ideal for showcasing one photo at a time.
                              </div>
                              <div className="mt-3 relative bg-muted-foreground/10 rounded-md" style={{height: "80px"}}>
                                <div className="absolute inset-0 bg-muted-foreground/20 rounded-md"></div>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center">
                                  <div className="w-2 h-2 border-l-2 border-b-2 border-primary transform -rotate-45 -translate-x-px"></div>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center">
                                  <div className="w-2 h-2 border-r-2 border-t-2 border-primary transform -rotate-45 translate-x-px"></div>
                                </div>
                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary' : 'bg-background/50'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Upload Settings */}
          <Card style={{ 
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            background: 'var(--background)',
            overflow: 'hidden'
          }}>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-base font-medium">Upload Permissions</h3>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowUploads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="text-base">Require Approval</FormLabel>
                        </div>
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
            </CardContent>
          </Card>
        </div>
        
        {/* File Settings */}
        <Card style={{ 
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          background: 'var(--background)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <FileType className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">File Settings</h3>
            </div>
            
            <FormField
              control={form.control}
              name="maxUploadSize"
              render={({ field }) => (
                <FormItem style={{ maxWidth: '400px' }}>
                  <FormLabel>Maximum Upload Size (MB)</FormLabel>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <span>MB</span>
                  </div>
                  <FormDescription>
                    Maximum file size for uploads (1-50 MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Advanced Settings (placeholder for future expansion) */}
        <Card style={{ 
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          background: 'var(--background)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <MoreHorizontal className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">Advanced Settings</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Additional gallery settings will be available in a future update. Stay tuned!
            </p>
          </CardContent>
        </Card>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--border)',
          paddingTop: '24px'
        }}>
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 