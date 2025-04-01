"use client"

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Tag, 
  MapPin, 
  Clock, 
  Settings,
  Check,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Template data
// In a real implementation, this would come from a database
const templates = [
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'A comprehensive template for wedding events with photo booth and gallery settings.',
    category: 'Celebration',
    features: ['Photo Booth', 'Guest Gallery', 'RSVP Management'],
    icon: <Calendar className="h-8 w-8 text-blue-500" />,
    details: {
      description: 'Perfect for wedding photographers and event planners looking to streamline the wedding photo experience. This template includes custom gallery sections for ceremony, reception, and candid moments, plus integrated RSVP management and a photo booth mode.',
      settings: {
        galleryAccess: 'Password protected',
        photoBooth: 'Enabled with 4 templates',
        sharing: 'Private with guest access',
        uploadOptions: 'Photographer and selected guests',
        aiFeatures: 'Smart grouping and face detection'
      },
      compatibility: ['Indoor venues', 'Outdoor settings', 'Day/night events'],
      recommendations: ['Wedding ceremonies', 'Engagement parties', 'Anniversary celebrations']
    }
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    description: 'Perfect for conferences, meetings, and corporate gatherings.',
    category: 'Business',
    features: ['Professional Gallery', 'Branded Experience', 'Access Control'],
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    details: {
      description: 'Designed for corporate photographers and event managers handling professional business events. This template features branded galleries, controlled access options, and professional photo organization.',
      settings: {
        galleryAccess: 'Email domain restricted',
        photoBooth: 'Professional headshots mode',
        sharing: 'Branded corporate sharing',
        uploadOptions: 'Official photographers only',
        aiFeatures: 'Business card scanning and networking data'
      },
      compatibility: ['Conference centers', 'Meeting rooms', 'Exhibition halls'],
      recommendations: ['Conferences', 'Trade shows', 'Team building events', 'Annual meetings']
    }
  },
  {
    id: 'birthday',
    name: 'Birthday Party',
    description: 'Casual event template with fun photo features and sharing options.',
    category: 'Celebration',
    features: ['Fun Filters', 'Social Sharing', 'Guest Uploads'],
    icon: <Tag className="h-8 w-8 text-pink-500" />,
    details: {
      description: 'A fun, social-focused template perfect for birthday parties and casual celebrations. Includes playful filters, easy social media sharing, and collaborative photo albums.',
      settings: {
        galleryAccess: 'Open with optional password',
        photoBooth: 'Fun filters and props',
        sharing: 'Social media integration',
        uploadOptions: 'All guests can contribute',
        aiFeatures: 'Auto-enhance and fun effects'
      },
      compatibility: ['Home settings', 'Party venues', 'Restaurants'],
      recommendations: ['Birthday parties', 'Casual gatherings', 'Kids events']
    }
  },
  {
    id: 'concert',
    name: 'Concert/Performance',
    description: 'Template for music events, performances, and shows.',
    category: 'Entertainment',
    features: ['Stage Photos', 'Crowd Shots', 'Artist Highlights'],
    icon: <MapPin className="h-8 w-8 text-purple-500" />,
    details: {
      description: 'Specialized for concert photographers and performance documentarians. Features optimized settings for low-light, stage lighting, and crowd captures.',
      settings: {
        galleryAccess: 'Public with premium options',
        photoBooth: 'Backstage photo experience',
        sharing: 'Artist approval workflow',
        uploadOptions: 'Official photographers with guest submissions',
        aiFeatures: 'Stage lighting enhancement and sound-synced capture'
      },
      compatibility: ['Concert venues', 'Theaters', 'Outdoor festivals'],
      recommendations: ['Music concerts', 'Theater performances', 'Dance recitals', 'Comedy shows']
    }
  },
  {
    id: 'workshop',
    name: 'Workshop/Class',
    description: 'For educational events, workshops, and classes.',
    category: 'Education',
    features: ['Progress Documentation', 'Instructor Access', 'Student Galleries'],
    icon: <Clock className="h-8 w-8 text-green-500" />,
    details: {
      description: 'Tailored for educational environments and workshop documentation. Includes progress tracking, instructional material integration, and collaborative learning spaces.',
      settings: {
        galleryAccess: 'Class-restricted access',
        photoBooth: 'Before/after demonstration setup',
        sharing: 'Educational materials integration',
        uploadOptions: 'Instructor and student segregated uploads',
        aiFeatures: 'Progress tracking and skill development visualization'
      },
      compatibility: ['Classrooms', 'Workshop spaces', 'Training centers'],
      recommendations: ['Art workshops', 'Cooking classes', 'Professional training', 'Educational seminars']
    }
  },
  {
    id: 'custom',
    name: 'Custom Template',
    description: 'Start with a blank template and customize everything.',
    category: 'Custom',
    features: ['Fully Customizable', 'No Presets', 'Complete Control'],
    icon: <Settings className="h-8 w-8 text-gray-500" />,
    details: {
      description: 'A blank slate for photographers and event managers who want complete control. Start from scratch and build your perfect event photography setup.',
      settings: {
        galleryAccess: 'Fully customizable',
        photoBooth: 'Optional with custom setup',
        sharing: 'Define your own sharing rules',
        uploadOptions: 'Complete control over contributors',
        aiFeatures: 'Select and customize AI integrations'
      },
      compatibility: ['Any venue', 'Any event type', 'Custom requirements'],
      recommendations: ['Specialized events', 'Unique venues', 'Custom client requirements']
    }
  },
];

interface PageProps {
  params: {
    id: string;
  };
}

export default function TemplatePreviewPage({ params }: PageProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const template = templates.find(t => t.id === params.id);
  
  if (!template) {
    return notFound();
  }

  // Function to render the appropriate icon based on template ID
  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'wedding':
        return <Calendar className="h-16 w-16 text-blue-500" />;
      case 'corporate':
        return <Users className="h-16 w-16 text-indigo-500" />;
      case 'birthday':
        return <Tag className="h-16 w-16 text-pink-500" />;
      case 'concert':
        return <MapPin className="h-16 w-16 text-purple-500" />;
      case 'workshop':
        return <Clock className="h-16 w-16 text-green-500" />;
      case 'custom':
        return <Settings className="h-16 w-16 text-gray-500" />;
      default:
        return <Calendar className="h-16 w-16 text-blue-500" />;
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Button variant="ghost" size="sm" asChild style={{ marginRight: '16px' }}>
          <Link href="/protected/templates">
            <ArrowLeft style={{ marginRight: '8px', width: '16px', height: '16px' }} />
            Back to Templates
          </Link>
        </Button>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginBottom: '0'
        }}>
          {template.name} Template
        </h1>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr' : '1fr 2fr'),
        gap: isMobile ? '16px' : '24px',
        width: '100%'
      }}>
        {/* Template Overview Card */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader style={{ paddingBottom: '16px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {getTemplateIcon(template.id)}
              <CardTitle style={{ marginTop: '16px' }}>{template.name}</CardTitle>
              <CardDescription>{template.category}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {template.description}
            </p>
            <div style={{ marginTop: '8px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Key Features
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {template.features.map((feature, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '14px' 
                  }}>
                    <Check style={{ 
                      width: '16px', 
                      height: '16px', 
                      color: 'var(--primary)',
                      marginRight: '8px'
                    }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter style={{ 
            borderTop: '1px solid var(--border)', 
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Button asChild>
              <Link href={`/protected/events/create?template=${template.id}`}>
                Use This Template
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Template Details Card */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Comprehensive information about this template</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <Tabs defaultValue="overview" style={{ width: '100%' }}>
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <TabsList style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: isMobile ? 'space-between' : 'flex-start',
                  padding: isMobile ? '0 8px' : '0 24px'
                }}>
                  <TabsTrigger value="overview" style={{ flex: isMobile ? '1' : 'inherit' }}>Overview</TabsTrigger>
                  <TabsTrigger value="settings" style={{ flex: isMobile ? '1' : 'inherit' }}>Settings</TabsTrigger>
                  <TabsTrigger value="compatibility" style={{ flex: isMobile ? '1' : 'inherit' }}>Compatibility</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" style={{ 
                padding: isMobile ? '16px' : '24px',
                paddingTop: isMobile ? '12px' : '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px' }}>{template.details.description}</p>
                  
                  <div style={{ marginTop: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Recommended For
                    </h3>
                    <ul style={{ 
                      listStyleType: 'disc', 
                      listStylePosition: 'inside',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {template.details.recommendations.map((item, i) => (
                        <li key={i} style={{ 
                          fontSize: '14px',
                          color: 'var(--muted-foreground)'
                        }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" style={{ 
                padding: isMobile ? '16px' : '24px',
                paddingTop: isMobile ? '12px' : '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Default Settings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Gallery Access:</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted-foreground)'
                      }}>
                        {template.details.settings.galleryAccess}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Photo Booth:</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted-foreground)'
                      }}>
                        {template.details.settings.photoBooth}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Sharing Options:</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted-foreground)'
                      }}>
                        {template.details.settings.sharing}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Upload Options:</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted-foreground)'
                      }}>
                        {template.details.settings.uploadOptions}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>AI Features:</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted-foreground)'
                      }}>
                        {template.details.settings.aiFeatures}
                      </div>
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--muted-foreground)',
                    marginTop: '16px'
                  }}>
                    All settings can be customized after selecting this template.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="compatibility" style={{ 
                padding: isMobile ? '16px' : '24px',
                paddingTop: isMobile ? '12px' : '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Best For
                  </h3>
                  <ul style={{ 
                    listStyleType: 'disc', 
                    listStylePosition: 'inside',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {template.details.compatibility.map((item, i) => (
                      <li key={i} style={{ 
                        fontSize: '14px',
                        color: 'var(--muted-foreground)'
                      }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 