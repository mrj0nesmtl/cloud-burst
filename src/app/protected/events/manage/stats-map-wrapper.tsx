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
  // Mobile detection with more granular breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsSmallMobile(width < 480); // Extra small devices
      setIsMobile(width < 768); // Mobile devices
      setIsTablet(width >= 768 && width < 1024); // Tablets
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

  // Common card styles
  const getCardStyle = (baseColor: string) => ({
    borderRadius: '10px',
    overflow: 'hidden',
    height: '100%',
    border: `1px solid rgba(${baseColor}, 0.4)`,
    backgroundColor: `rgba(${baseColor}, 0.08)`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as 'border-box'
  });

  // Common header styles
  const cardHeaderStyle = {
    display: 'flex' as const, 
    flexDirection: 'row' as const, 
    alignItems: 'center' as const, 
    justifyContent: 'space-between' as const, 
    paddingTop: isMobile ? '14px' : '16px',
    paddingBottom: isMobile ? '6px' : '8px',
    paddingLeft: isMobile ? '14px' : '16px',
    paddingRight: isMobile ? '14px' : '16px'
  };

  // Common content styles
  const cardContentStyle = {
    paddingBottom: isMobile ? '14px' : '16px',
    paddingLeft: isMobile ? '14px' : '16px',
    paddingRight: isMobile ? '14px' : '16px'
  };

  // Title text style
  const getTitleStyle = (color: string) => ({
    fontSize: isSmallMobile ? '13px' : '14px', 
    fontWeight: 600, 
    color: color,
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis'
  });

  // Icon container style
  const getIconContainerStyle = (baseColor: string) => ({
    height: isMobile ? '32px' : '36px', 
    width: isMobile ? '32px' : '36px', 
    minWidth: isMobile ? '32px' : '36px', // Prevent shrinking
    borderRadius: '8px', 
    backgroundColor: `rgba(${baseColor}, 0.25)`, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: `1px solid rgba(${baseColor}, 0.3)`,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    marginLeft: '8px'
  });

  // Value text style
  const getValueStyle = (color: string) => ({
    fontSize: isSmallMobile ? '24px' : isMobile ? '26px' : '28px', 
    fontWeight: 700, 
    color: color
  });

  // Subtitle text style
  const subtitleStyle = {
    fontSize: isSmallMobile ? '12px' : '13px', 
    color: 'var(--muted-foreground)', 
    margin: 0,
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis'
  };

  return (
    <div style={{ 
      display: 'grid', 
      gap: isMobile ? '14px' : '20px',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      marginBottom: '24px',
      padding: isMobile ? '4px' : '0px',
      boxSizing: 'border-box' as 'border-box'
    }}>
      {/* Total Events Card - Blue */}
      <div 
        style={getCardStyle('59, 130, 246')} 
        onMouseOver={(e) => {
          if (!isMobile) { // Only apply hover effects on non-mobile
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
          }
        }} 
        onMouseOut={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          }
        }}
      >
        <div style={cardHeaderStyle}>
          <span style={getTitleStyle('rgb(37, 99, 235)')}>Total Events</span>
          <div style={getIconContainerStyle('59, 130, 246')}>
            <Calendar style={{ height: isMobile ? '16px' : '18px', width: isMobile ? '16px' : '18px', color: 'rgb(37, 99, 235)' }} />
          </div>
        </div>
        <div style={cardContentStyle}>
          <div style={getValueStyle('rgb(37, 99, 235)')}>{processedEvents.length}</div>
          <p style={subtitleStyle}>
            {publishedEvents.length} published, {processedEvents.length - publishedEvents.length} other
          </p>
        </div>
      </div>
      
      {/* Total Attendees Card - Green */}
      <div 
        style={getCardStyle('16, 185, 129')} 
        onMouseOver={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
          }
        }} 
        onMouseOut={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          }
        }}
      >
        <div style={cardHeaderStyle}>
          <span style={getTitleStyle('rgb(5, 150, 105)')}>Total Attendees</span>
          <div style={getIconContainerStyle('16, 185, 129')}>
            <Users style={{ height: isMobile ? '16px' : '18px', width: isMobile ? '16px' : '18px', color: 'rgb(5, 150, 105)' }} />
          </div>
        </div>
        <div style={cardContentStyle}>
          <div style={getValueStyle('rgb(5, 150, 105)')}>{totalAttendees}</div>
          <p style={subtitleStyle}>
            Across {Object.keys(attendeeCounts).length} events (includes RSVPs)
          </p>
        </div>
      </div>
      
      {/* Average Attendees Card - Amber */}
      <div 
        style={getCardStyle('245, 158, 11')} 
        onMouseOver={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
          }
        }} 
        onMouseOut={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          }
        }}
      >
        <div style={cardHeaderStyle}>
          <span style={getTitleStyle('rgb(217, 119, 6)')}>
            {isSmallMobile ? 'Avg. Attendees' : 'Avg. Attendees per Event'}
          </span>
          <div style={getIconContainerStyle('245, 158, 11')}>
            <Activity style={{ height: isMobile ? '16px' : '18px', width: isMobile ? '16px' : '18px', color: 'rgb(217, 119, 6)' }} />
          </div>
        </div>
        <div style={cardContentStyle}>
          <div style={getValueStyle('rgb(217, 119, 6)')}>
            {totalAttendees > 0 && Object.keys(attendeeCounts).length > 0
              ? Math.round(totalAttendees / Object.keys(attendeeCounts).length)
              : 0}
          </div>
          <p style={subtitleStyle}>
            {totalAttendees > 0 ? '+0.1% from last month' : 'No historical data'}
          </p>
        </div>
      </div>
      
      {/* Event Locations Card - Purple */}
      <div 
        style={getCardStyle('139, 92, 246')} 
        onMouseOver={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
          }
        }} 
        onMouseOut={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
          }
        }}
      >
        <div style={cardHeaderStyle}>
          <span style={getTitleStyle('rgb(124, 58, 237)')}>Event Locations</span>
          <div style={getIconContainerStyle('139, 92, 246')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              style={{ height: isMobile ? '16px' : '18px', width: isMobile ? '16px' : '18px', color: 'rgb(124, 58, 237)' }}
            >
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              <path d="M3.6 9h16.8" />
              <path d="M3.6 15h16.8" />
              <path d="M12 3a4.5 4.5 0 0 0 0 18 4.5 4.5 0 0 0 0-18Z" />
            </svg>
          </div>
        </div>
        <div style={cardContentStyle}>
          <div style={getValueStyle('rgb(124, 58, 237)')}>{processedEvents.length}</div>
          <p style={subtitleStyle}>
            View event locations on the map
          </p>
        </div>
      </div>
      
      {/* Event Map */}
      <div style={{ 
        gridColumn: '1 / -1',
        border: '1px solid rgba(var(--primary-rgb), 0.25)',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: 'var(--card)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box' as 'border-box'
      }}>
        <div style={{
          padding: isMobile ? '14px 14px 8px 14px' : '16px 16px 8px 16px',
          borderBottom: '1px solid rgba(var(--primary-rgb), 0.1)'
        }}>
          <h3 style={{ 
            fontSize: isMobile ? '15px' : '16px', 
            fontWeight: 600, 
            margin: 0, 
            marginBottom: '4px' 
          }}>
            Event Locations
          </h3>
          <p style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            color: 'var(--muted-foreground)', 
            margin: 0 
          }}>
            Geographical distribution of your events
          </p>
        </div>
        <div style={{ 
          height: isSmallMobile ? '200px' : isMobile ? '250px' : '400px', 
          padding: 0, 
          overflow: 'hidden', 
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          width: '100%'
        }}>
          {mapComponent}
        </div>
      </div>
    </div>
  );
} 