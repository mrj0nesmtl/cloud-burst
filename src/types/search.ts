import { Event } from './events';

/**
 * Search result types for the application
 */

export interface SearchResult {
  id: string;
  type: 'event' | 'photo' | 'user';
  title: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  relevance: number;
}

export interface EventSearchResult extends SearchResult {
  type: 'event';
  event: Event;
}

export interface PhotoSearchResult extends SearchResult {
  type: 'photo';
  event_id: string;
  filename: string;
}

export interface UserSearchResult extends SearchResult {
  type: 'user';
  email: string;
}

export type SearchResults = Array<EventSearchResult | PhotoSearchResult | UserSearchResult>; 