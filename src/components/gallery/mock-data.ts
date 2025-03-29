import { PhotoItem } from './EventGallery';

// Mock gallery data structure
interface GalleryData {
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  description: string;
  photos: PhotoItem[];
}

// Collection of mock galleries indexed by event ID
export const mockGalleries: Record<string, GalleryData> = {
  // Wedding gallery
  '1': {
    eventId: '1',
    eventName: 'Johnson Wedding',
    eventDate: '2023-08-15',
    location: 'Grand Plaza Hotel, New York',
    description: 'Beautiful summer wedding ceremony and reception at the Grand Plaza',
    photos: [
      {
        id: '101',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Wedding Ceremony',
        description: 'The beautiful ceremony at Johnson Wedding',
        tags: ['ceremony', 'wedding', 'couple'],
        dateUploaded: '2023-08-16T10:30:00Z',
        views: 423,
        likes: 89,
        downloads: 12,
        featured: true
      },
      {
        id: '102',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'First Dance',
        description: 'First dance as husband and wife',
        tags: ['reception', 'dance', 'couple'],
        dateUploaded: '2023-08-16T11:15:00Z',
        views: 312,
        likes: 76,
        downloads: 8,
        featured: true
      },
      {
        id: '103',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Cake Cutting',
        description: 'The newlyweds cutting the cake',
        tags: ['reception', 'cake', 'tradition'],
        dateUploaded: '2023-08-16T12:00:00Z',
        views: 287,
        likes: 65,
        downloads: 5
      },
      {
        id: '104',
        url: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Venue Decoration',
        description: 'Beautiful flower arrangements at the venue',
        tags: ['decoration', 'flowers', 'venue'],
        dateUploaded: '2023-08-16T09:45:00Z',
        views: 215,
        likes: 48,
        downloads: 3
      },
      {
        id: '105',
        url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Wedding Toast',
        description: 'Best man giving a toast at the reception',
        tags: ['reception', 'toast', 'speech'],
        dateUploaded: '2023-08-16T13:20:00Z',
        views: 189,
        likes: 42,
        downloads: 2
      },
      {
        id: '106',
        url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Evening Celebration',
        description: 'Evening party with all guests',
        tags: ['reception', 'party', 'evening'],
        dateUploaded: '2023-08-16T20:15:00Z',
        views: 275,
        likes: 58,
        downloads: 7
      }
    ]
  },
  
  // Conference event
  '2': {
    eventId: '2',
    eventName: 'Tech Conference 2023',
    eventDate: '2023-06-20',
    location: 'Convention Center, San Francisco',
    description: 'Annual tech conference showcasing the latest innovations and trends',
    photos: [
      {
        id: '201',
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Keynote Address',
        description: 'Opening keynote presentation',
        tags: ['keynote', 'presentation', 'technology'],
        dateUploaded: '2023-06-20T09:30:00Z',
        views: 512,
        likes: 97,
        downloads: 25,
        featured: true
      },
      {
        id: '202',
        url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Workshop Session',
        description: 'Interactive workshop on new technologies',
        tags: ['workshop', 'training', 'interactive'],
        dateUploaded: '2023-06-20T13:15:00Z',
        views: 387,
        likes: 72,
        downloads: 18
      },
      {
        id: '203',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Networking Lunch',
        description: 'Attendees networking during lunch break',
        tags: ['networking', 'lunch', 'social'],
        dateUploaded: '2023-06-20T12:45:00Z',
        views: 294,
        likes: 43,
        downloads: 7
      },
      {
        id: '204',
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Product Demo',
        description: 'Demonstration of new tech products',
        tags: ['demo', 'product', 'innovation'],
        dateUploaded: '2023-06-20T15:30:00Z',
        views: 432,
        likes: 86,
        downloads: 21,
        featured: true
      },
      {
        id: '205',
        url: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Panel Discussion',
        description: 'Industry experts discussing future trends',
        tags: ['panel', 'discussion', 'experts'],
        dateUploaded: '2023-06-20T16:45:00Z',
        views: 376,
        likes: 68,
        downloads: 14
      }
    ]
  },
  
  // Birthday party
  '3': {
    eventId: '3',
    eventName: 'Emma\'s 30th Birthday',
    eventDate: '2023-09-10',
    location: 'Sunset Lounge, Miami',
    description: 'Celebration of Emma\'s 30th birthday with friends and family',
    photos: [
      {
        id: '301',
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Birthday Cake',
        description: 'The incredible 3-tier birthday cake',
        tags: ['cake', 'birthday', 'celebration'],
        dateUploaded: '2023-09-10T21:15:00Z',
        views: 342,
        likes: 87,
        downloads: 11,
        featured: true
      },
      {
        id: '302',
        url: 'https://images.unsplash.com/photo-1464347192053-8a63d9a1481a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1464347192053-8a63d9a1481a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Venue Decorations',
        description: 'Beautiful party setup at the venue',
        tags: ['decorations', 'venue', 'party'],
        dateUploaded: '2023-09-10T19:30:00Z',
        views: 265,
        likes: 59,
        downloads: 8
      },
      {
        id: '303',
        url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Friends Group Photo',
        description: 'Emma with her close friends',
        tags: ['friends', 'group', 'people'],
        dateUploaded: '2023-09-10T22:00:00Z',
        views: 312,
        likes: 76,
        downloads: 9
      },
      {
        id: '304',
        url: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Dance Floor',
        description: 'Everyone enjoying the music on the dance floor',
        tags: ['dancing', 'party', 'music'],
        dateUploaded: '2023-09-11T00:30:00Z',
        views: 289,
        likes: 64,
        downloads: 5
      },
      {
        id: '305',
        url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Gift Opening',
        description: 'Emma opening her birthday presents',
        tags: ['gifts', 'celebration', 'surprise'],
        dateUploaded: '2023-09-10T23:15:00Z',
        views: 245,
        likes: 53,
        downloads: 4,
        featured: true
      }
    ]
  },
  
  // Map to Supabase IDs for easy lookup
  'b63b0192-d8cb-4103-8f0e-d115d61885b4': {
    eventId: 'b63b0192-d8cb-4103-8f0e-d115d61885b4',
    eventName: 'Johnson Wedding',
    eventDate: '2023-08-15',
    location: 'Grand Plaza Hotel, New York',
    description: 'Beautiful summer wedding ceremony and reception at the Grand Plaza',
    photos: [
      {
        id: '101',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Wedding Ceremony',
        description: 'The beautiful ceremony at Johnson Wedding',
        tags: ['ceremony', 'wedding', 'couple'],
        dateUploaded: '2023-08-16T10:30:00Z',
        views: 423,
        likes: 89,
        downloads: 12,
        featured: true
      },
      {
        id: '102',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'First Dance',
        description: 'First dance as husband and wife',
        tags: ['reception', 'dance', 'couple'],
        dateUploaded: '2023-08-16T11:15:00Z',
        views: 312,
        likes: 76,
        downloads: 8,
        featured: true
      },
      {
        id: '103',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Cake Cutting',
        description: 'The newlyweds cutting the cake',
        tags: ['reception', 'cake', 'tradition'],
        dateUploaded: '2023-08-16T12:00:00Z',
        views: 287,
        likes: 65,
        downloads: 5
      },
      {
        id: '104',
        url: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Venue Decoration',
        description: 'Beautiful flower arrangements at the venue',
        tags: ['decoration', 'flowers', 'venue'],
        dateUploaded: '2023-08-16T09:45:00Z',
        views: 215,
        likes: 48,
        downloads: 3
      },
      {
        id: '105',
        url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Wedding Toast',
        description: 'Best man giving a toast at the reception',
        tags: ['reception', 'toast', 'speech'],
        dateUploaded: '2023-08-16T13:20:00Z',
        views: 189,
        likes: 42,
        downloads: 2
      },
      {
        id: '106',
        url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Evening Celebration',
        description: 'Evening party with all guests',
        tags: ['reception', 'party', 'evening'],
        dateUploaded: '2023-08-16T20:15:00Z',
        views: 275,
        likes: 58,
        downloads: 7
      }
    ]
  },
  
  '4a237e9a-a62d-4f2a-878f-8f74e9a4ea85': {
    eventId: '4a237e9a-a62d-4f2a-878f-8f74e9a4ea85',
    eventName: 'Tech Conference 2023',
    eventDate: '2023-06-20',
    location: 'Convention Center, San Francisco',
    description: 'Annual tech conference showcasing the latest innovations and trends',
    photos: [
      {
        id: '201',
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Keynote Address',
        description: 'Opening keynote presentation',
        tags: ['keynote', 'presentation', 'technology'],
        dateUploaded: '2023-06-20T09:30:00Z',
        views: 512,
        likes: 97,
        downloads: 25,
        featured: true
      },
      {
        id: '202',
        url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Workshop Session',
        description: 'Interactive workshop on new technologies',
        tags: ['workshop', 'training', 'interactive'],
        dateUploaded: '2023-06-20T13:15:00Z',
        views: 387,
        likes: 72,
        downloads: 18
      },
      {
        id: '203',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Networking Lunch',
        description: 'Attendees networking during lunch break',
        tags: ['networking', 'lunch', 'social'],
        dateUploaded: '2023-06-20T12:45:00Z',
        views: 294,
        likes: 43,
        downloads: 7
      },
      {
        id: '204',
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Product Demo',
        description: 'Demonstration of new tech products',
        tags: ['demo', 'product', 'innovation'],
        dateUploaded: '2023-06-20T15:30:00Z',
        views: 432,
        likes: 86,
        downloads: 21,
        featured: true
      },
      {
        id: '205',
        url: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Panel Discussion',
        description: 'Industry experts discussing future trends',
        tags: ['panel', 'discussion', 'experts'],
        dateUploaded: '2023-06-20T16:45:00Z',
        views: 376,
        likes: 68,
        downloads: 14
      }
    ]
  },
  
  'c94e3e23-80d6-4e1e-ab33-71e3e4923bbe': {
    eventId: 'c94e3e23-80d6-4e1e-ab33-71e3e4923bbe',
    eventName: 'Emma\'s 30th Birthday',
    eventDate: '2023-09-10',
    location: 'Sunset Lounge, Miami',
    description: 'Celebration of Emma\'s 30th birthday with friends and family',
    photos: [
      {
        id: '301',
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Birthday Cake',
        description: 'The incredible 3-tier birthday cake',
        tags: ['cake', 'birthday', 'celebration'],
        dateUploaded: '2023-09-10T21:15:00Z',
        views: 342,
        likes: 87,
        downloads: 11,
        featured: true
      },
      {
        id: '302',
        url: 'https://images.unsplash.com/photo-1464347192053-8a63d9a1481a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1464347192053-8a63d9a1481a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Venue Decorations',
        description: 'Beautiful party setup at the venue',
        tags: ['decorations', 'venue', 'party'],
        dateUploaded: '2023-09-10T19:30:00Z',
        views: 265,
        likes: 59,
        downloads: 8
      },
      {
        id: '303',
        url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Friends Group Photo',
        description: 'Emma with her close friends',
        tags: ['friends', 'group', 'people'],
        dateUploaded: '2023-09-10T22:00:00Z',
        views: 312,
        likes: 76,
        downloads: 9
      },
      {
        id: '304',
        url: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Dance Floor',
        description: 'Everyone enjoying the music on the dance floor',
        tags: ['dancing', 'party', 'music'],
        dateUploaded: '2023-09-11T00:30:00Z',
        views: 289,
        likes: 64,
        downloads: 5
      },
      {
        id: '305',
        url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        title: 'Gift Opening',
        description: 'Emma opening her birthday presents',
        tags: ['gifts', 'celebration', 'surprise'],
        dateUploaded: '2023-09-10T23:15:00Z',
        views: 245,
        likes: 53,
        downloads: 4,
        featured: true
      }
    ]
  }
}; 