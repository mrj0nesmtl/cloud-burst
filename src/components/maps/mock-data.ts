import { LatLngExpression } from 'leaflet';

export interface EventLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  date?: string;
}

// Sample mock data for event locations
export const mockEventLocations: EventLocation[] = [
  {
    id: '1',
    name: 'Central Park Wedding',
    latitude: 40.785091,
    longitude: -73.968285,
    status: 'completed',
    date: '2023-05-15'
  },
  {
    id: '2',
    name: 'Tech Conference 2023',
    latitude: 37.773972,
    longitude: -122.431297,
    status: 'upcoming',
    date: '2023-11-10'
  },
  {
    id: '3',
    name: 'Beach Photoshoot',
    latitude: 25.761681,
    longitude: -80.191788,
    status: 'active',
    date: '2023-07-25'
  },
  {
    id: '4',
    name: 'Mountain Hiking Tour',
    latitude: 39.113014,
    longitude: -106.4436,
    status: 'draft',
    date: '2023-09-05'
  },
  {
    id: '5',
    name: 'City Nightlife Session',
    latitude: 51.507351,
    longitude: -0.127758,
    status: 'completed',
    date: '2023-04-18'
  }
]; 