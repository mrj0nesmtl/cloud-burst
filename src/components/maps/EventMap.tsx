'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Icon, LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EventLocation {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  coordinates: LatLngExpression;
}

interface EventMapProps {
  events: EventLocation[];
  className?: string;
  height?: string;
}

// Custom marker icons based on event status
const getMarkerIcon = (status: string): Icon => {
  const iconColor = 
    status === 'published' ? '#10b981' :  // green
    status === 'draft' ? '#f59e0b' :      // amber
    status === 'completed' ? '#3b82f6' :  // blue
    status === 'cancelled' ? '#ef4444' :  // red
    '#6b7280';                           // gray/default

  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor.replace('#', '')}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export function EventMap({ events, className = '', height = '500px' }: EventMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Default center point (can be adjusted based on events)
  const defaultCenter: LatLngExpression = [45.5017, -73.5673]; // Montreal
  const defaultZoom = 11;

  useEffect(() => {
    // Fix for Leaflet marker icon issue in Next.js
    const L = require('leaflet');
    
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Fit map to event bounds when events change
    if (mapRef.current && events.length > 0) {
      const L = require('leaflet');
      // Create bounds from all events
      const bounds = events.reduce((acc, event) => {
        // @ts-ignore - LatLngExpression type issue
        acc.extend(event.coordinates);
        return acc;
      }, new L.LatLngBounds(events[0].coordinates, events[0].coordinates));

      // Fit the map to these bounds with some padding
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [events]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoaded && (
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          
          {events.map((event) => (
            <Marker 
              key={event.id} 
              position={event.coordinates}
              icon={getMarkerIcon(event.status)}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-sm mb-1">{event.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{event.location}</p>
                  <p className="text-xs text-muted-foreground mb-2">{event.date}</p>
                  <Button asChild size="sm" className="w-full h-7 text-xs">
                    <Link href={`/protected/events/${event.id}`}>
                      View Event
                    </Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
} 