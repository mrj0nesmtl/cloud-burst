feat(gallery): Add guest reservation, gallery access & camera functionality

Implements the guest reservation, gallery setup, and camera integration features as part of Session 39:

- Added GuestReservationForm component with Zod validation
- Created guest reservation API endpoint with security measures
- Implemented GuestAuthCheck component for gallery authentication
- Added MediaUploader component for file uploads
- Created CameraCapture component for direct photo capture
- Implemented UploadButton with tabbed interface
- Built event gallery page with conditional authentication
- Added database migration for guests and permissions tables
- Implemented Row Level Security policies for data protection
- Added analytics tracking for guest registrations
- Updated documentation and status notes

This commit completes all the requirements for Session 39 and brings us one step closer to Beta Release Candidate 1. 