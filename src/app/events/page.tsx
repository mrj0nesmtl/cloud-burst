import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublicEvents } from '@/lib/supabase/events.server'
import { formatDate } from '@/lib/utils'
import { CalendarDays, MapPin, Camera, ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Public Events | Cloud Burst',
  description: 'Browse and explore public events on Cloud Burst',
}

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function PublicEventsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch public events with galleries
  const { data: events } = await supabase
    .from('events')
    .select(`
      id, name, date, location, cover_image_url,
      is_gallery_public, description, logo_url
    `)
    .eq('is_gallery_public', true)
    .order('date', { ascending: false })
    .limit(20)
  
  return (
    <main className="w-full min-h-screen bg-background">
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        padding: '3rem 1rem',
        backgroundImage: 'linear-gradient(to bottom, var(--background), var(--background-darker, #0e0e10))',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          zIndex: 0,
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)'
        }} />
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 'bold',
              lineHeight: 1.1,
              marginBottom: '1rem'
            }}>
              Discover Public Events
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              color: 'var(--muted-foreground)',
              marginBottom: '2rem',
              maxWidth: '650px',
              margin: '0 auto 2rem'
            }}>
              Browse through our collection of public events and explore their photo galleries.
              Find inspiration or contribute your own photos.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center'
            }} className="sm:flex-row">
              <Button className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto" size="lg" asChild>
                <Link href="/auth/register">
                  Create Your Own Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/marketing/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Events Grid */}
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 1rem'
      }}>
        {events && events.length > 0 ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>All Public Events</h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted-foreground)'
                }}>{events.length} events found</span>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {events.map((event) => (
                <Card key={event.id} style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--card)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  willChange: 'transform, box-shadow'
                }} className="hover:-translate-y-1 hover:shadow-xl">
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden'
                  }}>
                    {event.cover_image_url ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <Image
                          src={event.cover_image_url}
                          alt={event.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          style={{
                            transform: 'scale(1.01)'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '1rem',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                          opacity: 0.8,
                          transition: 'opacity 0.3s ease'
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            fontSize: '0.75rem',
                            color: 'white'
                          }}>
                            <CalendarDays style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                            {formatDate(event.date)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: 'var(--muted)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <Camera style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          color: 'var(--muted-foreground)'
                        }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    flexGrow: 1
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      lineHeight: '1.375',
                      marginBottom: '0.5rem',
                      transition: 'color 0.2s ease'
                    }}>
                      {event.name}
                    </h3>
                    
                    {event.location && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        fontSize: '0.875rem',
                        color: 'var(--muted-foreground)',
                        marginBottom: '0.5rem'
                      }}>
                        <MapPin style={{ minWidth: '1rem', height: '1rem', marginRight: '0.5rem', marginTop: '0.125rem' }} />
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{event.location}</span>
                      </div>
                    )}
                    
                    {event.description && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        flexGrow: 1,
                        marginBottom: '1rem'
                      }}>
                        {event.description}
                      </p>
                    )}
                    
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                    }}>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-all hover:scale-105" 
                        size="default"
                        asChild
                      >
                        <Link href={`/events/${event.id}/gallery`} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          View Gallery
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <Camera style={{
              width: '3rem',
              height: '3rem',
              margin: '0 auto 1rem',
              color: 'var(--muted-foreground)'
            }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>No public events available</h2>
            <p style={{
              color: 'var(--muted-foreground)',
              marginBottom: '2rem',
              maxWidth: '28rem',
              margin: '0 auto 2rem'
            }}>
              There are currently no public events to display. Check back later or create your own event!
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600" asChild>
              <Link href="/auth/register">
                Create Event
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
} 