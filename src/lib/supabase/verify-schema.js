// Script to verify database schema changes
// Usage: node verify-schema.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  try {
    console.log('Verifying database schema...\n');
    
    // 1. Check tables structure
    console.log('1. CHECKING TABLE STRUCTURES:');
    
    // Events table
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.error('Error querying events table:', eventsError);
    } else {
      const eventColumns = eventsData.length > 0 ? Object.keys(eventsData[0]) : [];
      console.log('\nEvents table columns:');
      console.log(eventColumns);
      
      // Check for required columns
      const requiredEventColumns = [
        'id', 'name', 'description', 'date', 'location', 
        'status', 'organizer_id', 'max_attendees', 'is_public', 
        'cover_image_url', 'qr_code_url', 'created_at', 'updated_at'
      ];
      
      const missingEventColumns = requiredEventColumns.filter(col => !eventColumns.includes(col));
      
      if (missingEventColumns.length === 0) {
        console.log('✅ Events table has all required columns');
      } else {
        console.log('❌ Events table is missing columns:', missingEventColumns);
      }
    }
    
    // Photos table
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .limit(1);
    
    if (photosError) {
      console.error('Error querying photos table:', photosError);
    } else {
      const photoColumns = photosData.length > 0 ? Object.keys(photosData[0]) : [];
      console.log('\nPhotos table columns:');
      console.log(photoColumns);
      
      // Check for required columns
      const requiredPhotoColumns = [
        'id', 'event_id', 'storage_path', 'uploaded_by', 'filename', 
        'size', 'mime_type', 'width', 'height', 'is_approved', 
        'metadata', 'created_at', 'updated_at'
      ];
      
      const missingPhotoColumns = requiredPhotoColumns.filter(col => !photoColumns.includes(col));
      
      if (missingPhotoColumns.length === 0) {
        console.log('✅ Photos table has all required columns');
      } else {
        console.log('❌ Photos table is missing columns:', missingPhotoColumns);
      }
    }
    
    // Event Attendees table
    const { data: attendeesData, error: attendeesError } = await supabase
      .from('event_attendees')
      .select('*')
      .limit(1);
    
    if (attendeesError) {
      console.error('Error querying event_attendees table:', attendeesError);
    } else {
      const attendeeColumns = attendeesData.length > 0 ? Object.keys(attendeesData[0]) : [];
      console.log('\nEvent Attendees table columns:');
      console.log(attendeeColumns);
      
      // Check for required columns
      const requiredAttendeeColumns = [
        'id', 'event_id', 'email', 'name', 'status', 
        'access_code', 'user_id', 'created_at', 'updated_at'
      ];
      
      const missingAttendeeColumns = requiredAttendeeColumns.filter(col => !attendeeColumns.includes(col));
      
      if (missingAttendeeColumns.length === 0) {
        console.log('✅ Event Attendees table has all required columns');
      } else {
        console.log('❌ Event Attendees table is missing columns:', missingAttendeeColumns);
      }
    }
    
    // 2. Check RLS policies
    console.log('\n2. CHECKING RLS POLICIES:');
    
    // We can't directly query RLS policies with the client, but we can test them
    console.log('\nTesting RLS policies by attempting operations:');
    
    // Test events RLS - try to select public events
    const { data: publicEvents, error: publicEventsError } = await supabase
      .from('events')
      .select('*')
      .eq('is_public', true)
      .limit(5);
    
    if (publicEventsError) {
      console.log('❌ Cannot select public events:', publicEventsError.message);
    } else {
      console.log(`✅ Successfully queried public events (${publicEvents.length} found)`);
    }
    
    // Test photos RLS - try to select photos
    const { data: publicPhotos, error: publicPhotosError } = await supabase
      .from('photos')
      .select('*')
      .limit(5);
    
    if (publicPhotosError) {
      console.log('❌ Cannot select photos:', publicPhotosError.message);
    } else {
      console.log(`✅ Successfully queried photos (${publicPhotos.length} found)`);
    }
    
    console.log('\nSchema verification complete!');
    
  } catch (error) {
    console.error('Unexpected error during verification:', error);
  }
}

// Run the verification
verifySchema(); 