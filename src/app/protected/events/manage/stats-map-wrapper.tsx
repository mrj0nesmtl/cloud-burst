'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Users } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string | null;
  status: string;
  attendeeCount: number;
  cover_image_url?: string | null;
}

interface StatsMapWrapperProps {
  processedEvents: Event[];
  publishedEvents: Event[];
  attendeeCounts: Record<string, number>;
  mapComponent: React.ReactNode;
}

export function StatsMapWrapper({
  processedEvents,
  publishedEvents,
  attendeeCounts,
  mapComponent
}: StatsMapWrapperProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Calculate total attendees
  const totalAttendees = Object.values(attendeeCounts).reduce(
    (total, count) => total + count,
    0
  );

  return (
    <div style={{ 
      display: 'grid', 
      gap: isMobile ? '16px' : '20px',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Total Events Card - Blue */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        width: '100%',
        maxWidth: '100%',
      }} onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
      }} onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
      }}>
        <div style={{ 
          display: 'flex' as const, 
          flexDirection: 'row' as const, 
          alignItems: 'center' as const, 
          justifyContent: 'space-between' as const, 
          paddingTop: '16px',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(37, 99, 235)' }}>Total Events</span>
          <div style={{ 
            height: '36px', 
            width: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(59, 130, 246, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
          }}>
            <Calendar style={{ height: '18px', width: '18px', color: 'rgb(37, 99, 235)' }} />
          </div>
        </div>
        <div style={{
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'rgb(37, 99, 235)' }}>{processedEvents.length}</div>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
            {publishedEvents.length} published, {processedEvents.length - publishedEvents.length} other
          </p>
        </div>
      </div>
      
      {/* Total Attendees Card - Green */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        width: '100%',
        maxWidth: '100%',
      }} onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
      }} onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      }}>
        <div style={{ 
          display: 'flex' as const, 
          flexDirection: 'row' as const, 
          alignItems: 'center' as const, 
          justifyContent: 'space-between' as const, 
          paddingTop: '16px',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(5, 150, 105)' }}>Total Attendees</span>
          <div style={{ 
            height: '36px', 
            width: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(16, 185, 129, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
          }}>
            <Users style={{ height: '18px', width: '18px', color: 'rgb(5, 150, 105)' }} />
          </div>
        </div>
        <div style={{
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'rgb(5, 150, 105)' }}>{totalAttendees}</div>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
            Across {Object.keys(attendeeCounts).length} events
          </p>
        </div>
      </div>
      
      {/* Average Attendees Card - Amber */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        width: '100%',
        maxWidth: '100%',
      }} onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
      }} onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      }}>
        <div style={{ 
          display: 'flex' as const, 
          flexDirection: 'row' as const, 
          alignItems: 'center' as const, 
          justifyContent: 'space-between' as const, 
          paddingTop: '16px',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(217, 119, 6)' }}>Avg. Attendees per Event</span>
          <div style={{ 
            height: '36px', 
            width: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(245, 158, 11, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
          }}>
            <Activity style={{ height: '18px', width: '18px', color: 'rgb(217, 119, 6)' }} />
          </div>
        </div>
        <div style={{
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'rgb(217, 119, 6)' }}>
            {totalAttendees > 0 && Object.keys(attendeeCounts).length > 0
              ? Math.round(totalAttendees / Object.keys(attendeeCounts).length)
              : 0}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
            {totalAttendees > 0 ? '+0.1% from last month' : 'No historical data'}
          </p>
        </div>
      </div>
      
      {/* Event Locations Card - Purple */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        width: '100%',
        maxWidth: '100%',
      }} onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
      }} onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
      }}>
        <div style={{ 
          display: 'flex' as const, 
          flexDirection: 'row' as const, 
          alignItems: 'center' as const, 
          justifyContent: 'space-between' as const, 
          paddingTop: '16px',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(124, 58, 237)' }}>Event Locations</span>
          <div style={{ 
            height: '36px', 
            width: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(139, 92, 246, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              style={{ height: '18px', width: '18px', color: 'rgb(124, 58, 237)' }}
            >
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              <path d="M3.6 9h16.8" />
              <path d="M3.6 15h16.8" />
              <path d="M12 3a4.5 4.5 0 0 0 0 18 4.5 4.5 0 0 0 0-18Z" />
            </svg>
          </div>
        </div>
        <div style={{
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'rgb(124, 58, 237)' }}>{processedEvents.length}</div>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
            View event locations on the map
          </p>
        </div>
      </div>
      
      {/* Event Map */}
      <div style={{ 
        gridColumn: '1 / -1',
        border: '1px solid rgba(var(--primary-rgb), 0.25)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: 'var(--card)',
        width: '100%',
        maxWidth: '100%'
      }}>
        <div style={{
          padding: '16px 16px 8px 16px',
          borderBottom: '1px solid rgba(var(--primary-rgb), 0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Event Locations</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
            Geographical distribution of your events
          </p>
        </div>
        <div style={{ 
          height: isMobile ? '250px' : '400px', 
          padding: 0, 
          overflow: 'hidden', 
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          width: '100%'
        }}>
          {mapComponent}
        </div>
      </div>
    </div>
  );
} 