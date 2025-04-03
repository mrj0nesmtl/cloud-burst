// Script to retrieve a valid invitation token for testing
const { createClient } = require('@supabase/supabase-js');

// Replace these with your Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const main = async () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get a sample invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, token, email, name, event_id, status, rsvp_status')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching invitation:', error);
    process.exit(1);
  }
  
  if (!invitation) {
    console.log('No invitations found. Creating a test invitation...');
    
    // Get a sample event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .limit(1)
      .single();
    
    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      console.log('Please create an event first.');
      process.exit(1);
    }
    
    // Create a test invitation
    const { data: newInvitation, error: createError } = await supabase
      .from('invitations')
      .insert({
        event_id: event.id,
        email: 'test@example.com',
        name: 'Test User',
        token: crypto.randomUUID(),
        status: 'sent',
        rsvp_status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          plus_one_allowed: true,
          notes: '',
          dietary_preferences: '',
        },
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating invitation:', createError);
      process.exit(1);
    }
    
    console.log('Test invitation created!');
    console.log('=========================');
    console.log(`Invitation ID: ${newInvitation.id}`);
    console.log(`Token: ${newInvitation.token}`);
    console.log(`Test URL: http://localhost:3000/invitation/${newInvitation.token}`);
    
    return;
  }
  
  console.log('Found existing invitation:');
  console.log('=========================');
  console.log(`Invitation ID: ${invitation.id}`);
  console.log(`Token: ${invitation.token}`);
  console.log(`Status: ${invitation.status}, RSVP Status: ${invitation.rsvp_status}`);
  console.log(`Name: ${invitation.name}, Email: ${invitation.email}`);
  console.log(`Event ID: ${invitation.event_id}`);
  console.log(`Test URL: http://localhost:3000/invitation/${invitation.token}`);
};

main().catch(console.error); 