# Session 42-B Kickoff Narrative: Guest Photo Upload Troubleshooting

## Focus: Camera Upload QA & Gallery Integration
**Date**: April 17, 2025
**Target Completion**: April 18, 2025

## AI Self-Prompt: Cloud Burst Photo Upload Troubleshooting

Hi Claude, let's continue working on the Cloud Burst platform, picking up exactly where we left off with troubleshooting the guest photo uploads to event galleries. 

We've successfully fixed several critical issues in Session 42:
1. We resolved the guest profile creation constraints by implementing the `handle_guest_profile` function
2. We fixed the RSVP submission handler to use correct column names
3. We implemented middleware checks to ensure guests have valid profiles before accessing the dashboard
4. We created the guest camera, upload, and gallery pages
5. We implemented the bottom navigation for the guest area

However, we still have an issue with photo uploads to the gallery. When a guest takes a photo using the camera page or uploads from the upload page, the photo appears to upload successfully, but it doesn't consistently appear in the gallery view. We fixed one issue related to table name references in the gallery query (changing from 'event_photos' to 'photos'), but some uploads still aren't appearing or are appearing with incorrect attribution.

Here's what we need to investigate:

1. **Database Schema & Query Issues**
   - The `photos` table structure and its relationships
   - How photos are associated with events and guests
   - The SQL queries used to fetch photos for the gallery
   - Permissions and RLS policies for the photos table

2. **Upload Process Issues**
   - The camera capture and file upload components
   - The API endpoint that handles the uploads
   - Token handling during the upload process
   - Error handling and progress tracking

3. **Gallery View Issues**
   - The component that displays photos in the gallery
   - Real-time updates for newly uploaded photos
   - Loading states and error handling
   - Performance optimization for large galleries

The most critical files involved are:
- `src/app/guest/camera/page.tsx` - Camera capture page
- `src/app/guest/upload/page.tsx` - File upload page
- `src/app/guest/gallery/page.tsx` - Gallery view page (already fixed the table name reference)
- `src/app/api/guest/upload/route.ts` - Upload API endpoint
- `src/components/media/camera-capture.tsx` - Camera interface component
- `src/components/media/file-uploader.tsx` - File upload component
- `src/components/gallery/photo-grid.tsx` - Gallery display component
- `src/lib/supabase/photos.ts` - Database operations for photos

I've already identified a few potential issues:
1. The upload API might not be properly associating photos with the correct event or guest
2. There might be permission issues preventing guests from seeing their own uploads
3. The real-time update mechanism for the gallery might not be working correctly
4. The token context might be lost during the upload process

To get a complete picture of what's happening, let's start by:
1. Examining the upload API endpoint code to see how photos are saved
2. Looking at the database schema and relationships
3. Checking the RLS policies for the photos table
4. Verifying the token handling during the upload process
5. Adding better logging throughout the upload flow

Remember, the primary goal is to ensure guests can successfully take photos with the camera and see them appear in the gallery correctly attributed to their event. This is a critical feature for the platform as we approach the beta release.

Let's also be mindful of edge cases:
- Poor network conditions during upload
- Multiple simultaneous uploads
- Very large image files
- Different device capabilities (older phones with limited camera access)
- Token expiration during long uploads

We should prioritize the most critical issues first, focusing on:
1. Ensuring uploads complete successfully
2. Properly associating photos with events and guests
3. Making sure photos appear in the gallery
4. Adding proper progress indication and error handling
5. Optimizing performance for large galleries

Let's get started by examining the relevant code and identifying the root causes of these issues!

## Technical Context

### Architecture Overview
Cloud Burst uses a Next.js 14 App Router architecture with Supabase for authentication, storage, and database. The photo upload flow involves:

1. Capturing photos via the device camera or file selection
2. Client-side processing (optional compression, format validation)
3. Secure upload to Supabase Storage
4. Creating a record in the `photos` table
5. Real-time updates in the gallery view

### Data Flow
1. User captures photo or selects file
2. Upload begins with progress tracking
3. On successful upload, database record is created
4. Gallery subscribes to changes in the photos table
5. New photos appear in the gallery via real-time updates

### Recent Changes
- Implemented guest profile creation with proper constraints
- Added photo upload functionality via camera and file selection
- Created gallery view with table name references fixed
- Added bottom navigation for improved UX
- Fixed middleware to validate guest profiles

### Known Issues
- Inconsistent appearance of uploaded photos in gallery
- Potential attribution issues with uploads
- Possible token persistence problems
- Lack of detailed progress and error feedback
- Performance concerns with large photo collections

## Implementation Strategy
1. Start with diagnostics - add detailed logging
2. Fix critical bugs preventing uploads from appearing
3. Enhance error handling and user feedback
4. Optimize performance
5. Add comprehensive testing across devices

Let's solve these issues systematically and ensure the guest photo upload experience is seamless and reliable! 