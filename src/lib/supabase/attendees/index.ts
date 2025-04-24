// Re-export client-side utilities
// This file provides a clean public API for attendees functionality

import {
  Attendee,
  getFirstAttendeeForToken,
  getEventAttendees,
  updateAttendee
} from '../attendees';

export {
  Attendee,
  getFirstAttendeeForToken,
  getEventAttendees,
  updateAttendee
};

// Add any additional client-side attendee utilities here
// Server-specific functionality should be imported directly from 'attendees.server' 