// Event activity data types
export interface EventActivityData {
  month: string;      // Short month name (e.g., "Jan")
  fullMonth: string;  // Full month and year (e.g., "January 2025")
  events: number;     // Count of events in the month
  invitations: number; // Count of invitations sent
  rsvps: number;      // Count of RSVPs received
  media: number;      // Count of media items uploaded
  total: number;      // Total count of all activities
}

// Time range options for filtering chart data
export type TimeRange = '30d' | '60d' | '90d'; 