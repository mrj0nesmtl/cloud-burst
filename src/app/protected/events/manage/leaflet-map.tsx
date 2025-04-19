'use client';

import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Event {
  id: string;
  name: string;
  location: string | null;
  status: string;
  coordinates?: [number, number] | null;
  isApproximate: boolean;
}

interface LeafletMapProps {
  events: Event[];
  getStatusColor: (status: string) => string;
  theme: 'light' | 'dark';
  isMobile: boolean;
}

// Helper component to set map view based on locations
function MapViewSetter({ events }: { events: Event[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!events.length) return;
    
    // Get valid locations
    const validLocations = events.filter(event => 
      event.coordinates && Array.isArray(event.coordinates) && event.coordinates.length === 2
    );
    
    if (!validLocations.length) return;
    
    // Function to determine if we have locations spread across multiple continents
    const hasGlobalSpread = () => {
      if (validLocations.length <= 1) return false;
      
      // Check if locations span across significant longitude differences
      const longitudes = validLocations.map(loc => loc.coordinates![1]);
      const minLong = Math.min(...longitudes);
      const maxLong = Math.max(...longitudes);
      
      // If we have locations spread more than 90 degrees apart, consider it global
      return (maxLong - minLong) > 90;
    };
    
    // Set appropriate zoom and center based on the spread of locations
    if (hasGlobalSpread()) {
      // For global view, zoom out and center on Atlantic for better world view
      map.setView([20, 0], 2);
    } else {
      // For regional view, fit bounds to the locations
      const bounds = L.latLngBounds(validLocations.map(loc => loc.coordinates!));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [map, events]);
  
  return null;
}

export function LeafletMap({ events, getStatusColor, theme, isMobile }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  
  // Create marker icons based on event status color and whether location is approximate
  const createMarkerIcon = (color: string, isApproximate: boolean = false) => {
    // Adjust marker size for mobile
    const size = isApproximate 
      ? (isMobile ? 12 : 16) 
      : (isMobile ? 18 : 24);
    
    const borderSize = isMobile ? 2 : 3;
    
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="
        position: relative;
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${borderSize}px solid ${theme === 'dark' ? '#333' : 'white'};
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
        ${isApproximate ? 'opacity: 0.7;' : ''}
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isApproximate ? '<span style="color: white; font-size: 10px;">?</span>' : ''}
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  };
  
  // Find center of all locations or default to a world map center
  const calculateCenter = (): [number, number] => {
    // Get valid locations
    const validLocations = events.filter(event => 
      event.coordinates && Array.isArray(event.coordinates) && event.coordinates.length === 2
    );
    
    if (!validLocations.length) return [20, 0]; // Center of world
    
    // If only one location, use it as center
    if (validLocations.length === 1) return validLocations[0].coordinates!;
    
    // Calculate the average of all coordinates
    let latSum = 0;
    let lngSum = 0;
    
    validLocations.forEach(loc => {
      latSum += loc.coordinates![0];
      lngSum += loc.coordinates![1];
    });
    
    return [latSum / validLocations.length, lngSum / validLocations.length];
  };
  
  useEffect(() => {
    // Create a stylesheet element instead of using innerHTML
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    
    const updateStyles = () => {
      // Use textContent instead of innerHTML for security
      const cssText = `
        .leaflet-container {
          background-color: ${theme === 'dark' ? '#1a1a1a' : '#f0f0f0'};
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          font-size: ${isMobile ? '12px' : '14px'};
        }
        .leaflet-popup-content-wrapper {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          border-radius: 8px;
          padding: ${isMobile ? '6px 10px' : '8px 12px'};
        }
        .leaflet-popup-tip {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
        }
        .leaflet-control-zoom a, .leaflet-control-attribution {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'} !important;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'} !important;
          font-size: ${isMobile ? '11px' : '12px'};
        }
        .approximate-location-badge {
          display: inline-block;
          font-size: ${isMobile ? '10px' : '11px'};
          background-color: ${theme === 'dark' ? '#444' : '#f0f0f0'};
          color: ${theme === 'dark' ? '#ddd' : '#666'};
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
        }
        .leaflet-popup-content {
          margin: ${isMobile ? '6px 8px' : '8px 12px'};
          width: auto !important;
        }
      `;
      
      // Use textContent which properly escapes content
      styleEl.textContent = cssText;
    };
    
    updateStyles();
    
    return () => {
      styleEl.remove();
    };
  }, [theme, isMobile]);
  
  // Get the appropriate tile layer URL based on the current theme
  const getTileLayerUrl = () => {
    return theme === 'dark' 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  };

  // Create map legend component
  const MapLegend = () => (
    <div style={{
      position: 'absolute',
      top: isMobile ? '10px' : '16px',
      right: isMobile ? '10px' : '16px',
      backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      color: theme === 'dark' ? '#e0e0e0' : '#333333',
      borderRadius: '8px',
      padding: isMobile ? '8px' : '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      zIndex: 999,
      fontSize: isMobile ? '10px' : '12px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Event Status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { status: 'published', label: 'Active' },
          { status: 'completed', label: 'Completed' },
          { status: 'draft', label: 'Upcoming' },
          { status: 'cancelled', label: 'Cancelled' }
        ].map(item => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: isMobile ? '8px' : '10px', 
              height: isMobile ? '8px' : '10px', 
              borderRadius: '50%', 
              backgroundColor: getStatusColor(item.status),
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }} />
            <span style={{ 
              fontSize: isMobile ? '10px' : '11px', 
              color: theme === 'dark' ? '#e0e0e0' : '#333333' 
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Get valid locations for the map
  const validLocations = events.filter(event => 
    event.coordinates && Array.isArray(event.coordinates) && event.coordinates.length === 2
  );

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={calculateCenter()}
        zoom={2} // Start with a global view
        style={{ height: '100%', width: '100%' }}
        ref={(map: L.Map) => { mapRef.current = map; }}
        minZoom={2} // Prevent zooming out too far
        worldCopyJump={true} // Enables the world to be shown multiple times horizontally
        zoomControl={!isMobile} // Hide zoom controls on mobile
        attributionControl={!isMobile} // Hide attribution on mobile
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getTileLayerUrl()}
          maxZoom={19}
        />
        <MapViewSetter events={events} />
        
        {validLocations.map((event) => (
          <Marker 
            key={event.id} 
            position={event.coordinates!} 
            icon={createMarkerIcon(getStatusColor(event.status), event.isApproximate)}
          >
            <Popup>
              <div>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  fontSize: isMobile ? '14px' : '16px',
                  color: theme === 'dark' ? '#e0e0e0' : '#333'
                }}>
                  {event.name}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: isMobile ? '12px' : '14px',
                  color: theme === 'dark' ? '#aaa' : '#666'
                }}>
                  {event.location || 'Location not specified'}
                </p>
                <p style={{ 
                  margin: '5px 0 0 0',
                  fontSize: isMobile ? '11px' : '13px',
                  display: 'flex',
                  alignItems: 'center',
                  color: theme === 'dark' ? '#bbb' : '#555'
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: isMobile ? '8px' : '10px', 
                    height: isMobile ? '8px' : '10px', 
                    borderRadius: '50%', 
                    backgroundColor: getStatusColor(event.status),
                    marginRight: '5px',
                    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
                  }}></span>
                  Status: {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </p>
                {event.isApproximate && (
                  <p className="approximate-location-badge">
                    Approximate location
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Only show legend if we have events */}
      {validLocations.length > 0 && <MapLegend />}
      
      {/* Empty state message when no events */}
      {validLocations.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
            padding: isMobile ? '15px' : '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '250px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📍</div>
            <h3 style={{ 
              fontSize: isMobile ? '16px' : '18px',
              color: theme === 'dark' ? '#e0e0e0' : '#333',
              margin: '0 0 8px 0'
            }}>
              No Event Locations
            </h3>
            <p style={{ 
              fontSize: isMobile ? '12px' : '14px',
              color: theme === 'dark' ? '#aaa' : '#666',
              margin: 0
            }}>
              Events with valid locations will appear on this map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 