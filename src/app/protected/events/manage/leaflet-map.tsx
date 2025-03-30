'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationData {
  id: string;
  name: string;
  location: string;
  status: string;
  coordinates: [number, number]; // [lat, lng]
  color: string;
}

interface LeafletMapProps {
  height: number;
  locations: LocationData[];
}

export function LeafletMap({ height, locations }: LeafletMapProps) {
  // Fix for leaflet icon issue in Next.js
  useEffect(() => {
    // Fix leaflet's default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }, []);

  // Find the central location to focus the map (average of all coordinates)
  const centralLocation = locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + loc.coordinates[0], 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.coordinates[1], 0) / locations.length
      ] as [number, number]
    : [39.8283, -98.5795] as [number, number]; // Center of US as fallback
  
  // Custom icon factory for each marker based on its status
  const createMarkerIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <>
      {/* Inject CSS for Leaflet to work with dark mode */}
      <style jsx global>{`
        .leaflet-container {
          height: ${height}px;
          width: 100%;
          background-color: #121212;
        }
        .leaflet-popup-content-wrapper {
          background-color: #1e1e1e;
          color: #e0e0e0;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background-color: #1e1e1e;
        }
        .leaflet-control-zoom a {
          background-color: #2d2d2d !important;
          color: #e0e0e0 !important;
          border-color: #444 !important;
        }
        .leaflet-control-attribution {
          background-color: rgba(0, 0, 0, 0.6) !important;
          color: #888 !important;
        }
      `}</style>
      
      <MapContainer
        center={centralLocation}
        zoom={4}
        style={{ height: `${height}px`, width: '100%' }}
      >
        {/* Dark mode map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Event markers */}
        {locations.map((loc) => (
          <Marker 
            key={loc.id}
            position={loc.coordinates}
            icon={createMarkerIcon(loc.color)}
          >
            <Popup>
              <div style={{ padding: '5px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{loc.name}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{loc.location}</div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '11px',
                  background: `${loc.color}20`,
                  color: loc.color,
                  padding: '3px 6px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {loc.status.charAt(0).toUpperCase() + loc.status.slice(1)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
} 