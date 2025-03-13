import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Github, Twitter, Instagram, Linkedin, Upload, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profile Settings | Cloud Burst',
  description: 'Manage your profile settings and social media connections',
}

export default async function ProfileSettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Profile Settings</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Manage your profile information and connected accounts
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="social">Social Connections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your profile information visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={profile?.full_name || ''} placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={profile?.username || ''} placeholder="Enter your username" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue={profile?.bio || ''} placeholder="Tell us about yourself" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue={profile?.location || ''} placeholder="Your location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input id="website" defaultValue={profile?.website || ''} placeholder="https://example.com" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="avatar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture or avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="text-3xl">{getInitials(profile?.full_name || 'User')}</AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Upload a picture in JPG, PNG or GIF format, max 5MB
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Picture
                  </Button>
                  <Button variant="destructive">Remove Picture</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>
                Connect your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Twitter className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="font-medium">Twitter</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.twitter_handle ? `@${profile.twitter_handle}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button variant={profile?.twitter_handle ? "outline" : "default"}>
                    {profile?.twitter_handle ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Instagram className="h-6 w-6 text-pink-500" />
                    <div>
                      <h3 className="font-medium">Instagram</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.instagram_handle ? `@${profile.instagram_handle}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button variant={profile?.instagram_handle ? "outline" : "default"}>
                    {profile?.instagram_handle ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Github className="h-6 w-6" />
                    <div>
                      <h3 className="font-medium">GitHub</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.github_handle ? `@${profile.github_handle}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button variant={profile?.github_handle ? "outline" : "default"}>
                    {profile?.github_handle ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Linkedin className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">LinkedIn</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.linkedin_url ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button variant={profile?.linkedin_url ? "outline" : "default"}>
                    {profile?.linkedin_url ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
