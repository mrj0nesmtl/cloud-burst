export interface Notification {
  id: string;
  message: string;
  type: 'event' | 'photo' | 'system' | 'user';
  read: boolean;
  createdAt: string;
  eventId?: string;
  eventCustomUrl?: string;
  userId?: string;
  photoId?: string;
  metadata?: Record<string, any>;
} 