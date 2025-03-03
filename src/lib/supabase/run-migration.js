// Script to run the migration in Supabase
// Usage: node run-migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '20240601_update_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    
    // Execute the SQL migration
    const { error } = await supabase.rpc('pgmigrate', { query: migrationSql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the changes
    console.log('\nVerifying tables structure:');
    
    // Check events table
    const { data: eventsColumns, error: eventsError } = await supabase.rpc('pg_inspect', { 
      table_name: 'events' 
    });
    
    if (eventsError) {
      console.error('Error verifying events table:', eventsError);
    } else {
      console.log('\nEvents table columns:');
      console.table(eventsColumns);
    }
    
    // Check photos table
    const { data: photosColumns, error: photosError } = await supabase.rpc('pg_inspect', { 
      table_name: 'photos' 
    });
    
    if (photosError) {
      console.error('Error verifying photos table:', photosError);
    } else {
      console.log('\nPhotos table columns:');
      console.table(photosColumns);
    }
    
    // Check event_attendees table
    const { data: attendeesColumns, error: attendeesError } = await supabase.rpc('pg_inspect', { 
      table_name: 'event_attendees' 
    });
    
    if (attendeesError) {
      console.error('Error verifying event_attendees table:', attendeesError);
    } else {
      console.log('\nEvent Attendees table columns:');
      console.table(attendeesColumns);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 