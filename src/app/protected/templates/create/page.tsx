import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Create Template | Cloud Burst',
  description: 'Create a new event template',
}

export default function CreateTemplatePage() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/protected/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Create Template</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Create a new reusable event template</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" placeholder="Corporate Event, Wedding, etc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="Business, Celebration, etc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what this template is for..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="mt-4">
                  Continue to Settings
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <p className="text-sm text-muted-foreground">
                  This feature is coming soon. You'll be able to customize privacy settings, upload controls, and more.
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline">
                  Back to Basics
                </Button>
                <Button>
                  Continue to Features
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <p className="text-sm text-muted-foreground">
                  This feature is coming soon. You'll be able to select features like photo booth templates, gallery layouts, and AI enhancements.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Back to Settings
                </Button>
                <Button>
                  Save Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Note: This is a preview of the template creation feature. Full functionality will be available in the next release.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 