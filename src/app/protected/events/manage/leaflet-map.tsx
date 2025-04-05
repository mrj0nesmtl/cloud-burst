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

interface EventLocation {
  id: string;
  name: string;
  location: string;
  status: string;
  coordinates: [number, number];
  color: string;
  isApproximateLocation?: boolean;
}

interface LeafletMapProps {
  height: number;
  locations: EventLocation[];
}

// Helper component to set map view based on locations
function MapViewSetter({ locations }: { locations: EventLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!locations.length) return;
    
    // Function to determine if we have locations spread across multiple continents
    const hasGlobalSpread = () => {
      if (locations.length <= 1) return false;
      
      // Check if locations span across significant longitude differences
      const longitudes = locations.map(loc => loc.coordinates[1]);
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
      const bounds = L.latLngBounds(locations.map(loc => loc.coordinates));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [map, locations]);
  
  return null;
}

export function LeafletMap({ height, locations }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Create marker icons based on event status color and whether location is approximate
  const createMarkerIcon = (color: string, isApproximate: boolean = false) => {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="
        position: relative;
        background-color: ${color};
        width: ${isApproximate ? '16px' : '24px'};
        height: ${isApproximate ? '16px' : '24px'};
        border-radius: 50%;
        border: 3px solid ${theme === 'dark' ? '#333' : 'white'};
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
        ${isApproximate ? 'opacity: 0.7;' : ''}
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isApproximate ? '<span style="color: white; font-size: 10px;">?</span>' : ''}
      </div>`,
      iconSize: [isApproximate ? 16 : 24, isApproximate ? 16 : 24],
      iconAnchor: [isApproximate ? 8 : 12, isApproximate ? 8 : 12],
    });
  };
  
  // Find center of all locations or default to a world map center
  const calculateCenter = (): [number, number] => {
    if (!locations.length) return [20, 0]; // Center of world
    
    // If only one location, use it as center
    if (locations.length === 1) return locations[0].coordinates;
    
    // Calculate the average of all coordinates
    let latSum = 0;
    let lngSum = 0;
    
    locations.forEach(loc => {
      latSum += loc.coordinates[0];
      lngSum += loc.coordinates[1];
    });
    
    return [latSum / locations.length, lngSum / locations.length];
  };
  
  useEffect(() => {
    // Detect theme by checking for dark mode class or media query
    const detectTheme = () => {
      // Check if document has a dark class or data attribute
      const isDarkMode = 
        document.documentElement.classList.contains('dark') || 
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setTheme(isDarkMode ? 'dark' : 'light');
    };
    
    // Initial detection
    detectTheme();
    
    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });
    
    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleChange);
    
    // Inject styles for map depending on theme
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    
    const updateStyles = () => {
      styleEl.innerHTML = `
        .leaflet-container {
          background-color: ${theme === 'dark' ? '#1a1a1a' : '#f0f0f0'};
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
        }
        .leaflet-popup-content-wrapper {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
        }
        .leaflet-popup-tip {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
        }
        .leaflet-control-zoom a, .leaflet-control-attribution {
          background-color: ${theme === 'dark' ? '#2a2a2a' : '#fff'} !important;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'} !important;
        }
        .approximate-location-badge {
          display: inline-block;
          font-size: 11px;
          background-color: ${theme === 'dark' ? '#444' : '#f0f0f0'};
          color: ${theme === 'dark' ? '#ddd' : '#666'};
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
        }
      `;
    };
    
    updateStyles();
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
      styleEl.remove();
    };
  }, [theme]);
  
  // Get the appropriate tile layer URL based on the current theme
  const getTileLayerUrl = () => {
    return theme === 'dark' 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <MapContainer
        center={calculateCenter()}
        zoom={2} // Start with a global view
        style={{ height: '100%', width: '100%' }}
        ref={(map: L.Map) => { mapRef.current = map; }}
        minZoom={2} // Prevent zooming out too far
        worldCopyJump={true} // Enables the world to be shown multiple times horizontally
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getTileLayerUrl()}
          maxZoom={19}
        />
        <MapViewSetter locations={locations} />
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={loc.coordinates} 
            icon={createMarkerIcon(loc.color, loc.isApproximateLocation)}
          >
            <Popup>
              <div>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  fontSize: '16px',
                  color: theme === 'dark' ? '#e0e0e0' : '#333'
                }}>
                  {loc.name}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: '14px',
                  color: theme === 'dark' ? '#aaa' : '#666'
                }}>
                  {loc.location}
                </p>
                <p style={{ 
                  margin: '5px 0 0 0',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  color: theme === 'dark' ? '#bbb' : '#555'
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: loc.color,
                    marginRight: '5px',
                    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
                  }}></span>
                  Status: {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                </p>
                {loc.isApproximateLocation && (
                  <p className="approximate-location-badge">
                    Approximate location
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 