import { Metadata } from 'next'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Users, MapPin, Tag, Clock, Settings } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Event Templates | Cloud Burst',
  description: 'Create and manage event templates',
}

export default function TemplatesPage() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Event Templates</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Create reusable templates for quick event setup
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button asChild>
          <Link href="/protected/templates/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<TemplatesSkeleton />}>
        <TemplatesList />
      </Suspense>
    </div>
  )
}

// Templates list component
function TemplatesList() {
  // For now, we'll use static templates
  // In a future implementation, these would come from the database
  const templates = [
    {
      id: 'wedding',
      name: 'Wedding',
      description: 'A template for wedding events with photo booth and gallery settings.',
      category: 'Celebration',
      features: ['Photo Booth', 'Guest Gallery', 'RSVP Management'],
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
    },
    {
      id: 'corporate',
      name: 'Corporate Event',
      description: 'Perfect for conferences, meetings, and corporate gatherings.',
      category: 'Business',
      features: ['Professional Gallery', 'Branded Experience', 'Access Control'],
      icon: <Users className="h-8 w-8 text-indigo-500" />,
    },
    {
      id: 'birthday',
      name: 'Birthday Party',
      description: 'Casual event template with fun photo features and sharing options.',
      category: 'Celebration',
      features: ['Fun Filters', 'Social Sharing', 'Guest Uploads'],
      icon: <Tag className="h-8 w-8 text-pink-500" />,
    },
    {
      id: 'concert',
      name: 'Concert/Performance',
      description: 'Template for music events, performances, and shows.',
      category: 'Entertainment',
      features: ['Stage Photos', 'Crowd Shots', 'Artist Highlights'],
      icon: <MapPin className="h-8 w-8 text-purple-500" />,
    },
    {
      id: 'workshop',
      name: 'Workshop/Class',
      description: 'For educational events, workshops, and classes.',
      category: 'Education',
      features: ['Progress Documentation', 'Instructor Access', 'Student Galleries'],
      icon: <Clock className="h-8 w-8 text-green-500" />,
    },
    {
      id: 'custom',
      name: 'Custom Template',
      description: 'Start with a blank template and customize everything.',
      category: 'Custom',
      features: ['Fully Customizable', 'No Presets', 'Complete Control'],
      icon: <Settings className="h-8 w-8 text-gray-500" />,
    },
  ];
  
  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-8">No templates found. Create your first template to get started.</p>
          <Button asChild>
            <Link href="/protected/templates/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {template.icon}
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {template.description}
            </p>
            <div className="space-y-1">
              {template.features.map((feature, index) => (
                <div key={index} className="text-sm flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/protected/templates/${template.id}`}>
                  Preview
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/protected/events/create?template=${template.id}`}>
                  Use Template
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Skeleton loader for templates
function TemplatesSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full animate-pulse mb-4" />
            <div className="h-4 bg-muted rounded w-full animate-pulse mb-2" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between w-full">
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 w-24 bg-muted rounded animate-pulse" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 