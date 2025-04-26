import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Define Guest Profile interface that combines relevant fields
export interface GuestProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  instagram?: string | null;
  bio?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  event_id: string;
  invitation_id: string;
  status?: string;
  newsletter_opt_in?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get guest profile data from all relevant sources using invitation token
 * This consolidates data from invitations, attendees, guests, and rsvps tables
 */
export async function getGuestProfileByToken(token: string): Promise<GuestProfile | null> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // Get invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, email, name, status')
      .eq('token', token)
      .single();
      
    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return null;
    }
    
    // Initialize the profile with invitation data
    const profile: GuestProfile = {
      name: invitation.name || '',
      email: invitation.email || '',
      event_id: invitation.event_id,
      invitation_id: invitation.id,
      status: invitation.status,
    };
    
    // Try to get attendee data
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (!attendeesError && attendees && attendees.length > 0) {
      const attendee = attendees[0];
      // Update profile with attendee data (attendee data takes precedence)
      if (attendee.name) profile.name = attendee.name;
      if (attendee.email) profile.email = attendee.email;
      if (attendee.phone) profile.phone = attendee.phone;
      if (attendee.status) profile.status = attendee.status;
      if (attendee.id) profile.id = attendee.id;
    }
    
    // Try to get RSVP data
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .maybeSingle();
      
    if (rsvpError && rsvpError.code !== 'PGRST116') {
      // Only log as error if it's not the "no rows returned" error
      console.error('Error fetching RSVP:', rsvpError);
    } else if (rsvpError && rsvpError.code === 'PGRST116') {
      // This is just informational - no RSVP exists yet
      console.log('No RSVP found for this invitation');
    } else if (!rsvpError && rsvp) {
      // Get additional data from RSVP if available
      if (rsvp.notes) profile.notes = rsvp.notes;
      // You can add more RSVP fields here if needed
    }
    
    // Try to get guest data
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('invitation_id', invitation.id)
      .maybeSingle();
      
    if (!guestError && guest) {
      // Guest data has highest precedence
      if (guest.name) profile.name = guest.name;
      if (guest.email) profile.email = guest.email;
      if (guest.phone) profile.phone = guest.phone;
      if (guest.notes) profile.notes = guest.notes;
      if (guest.avatar_url) profile.avatar_url = guest.avatar_url;
      if (guest.id) profile.id = guest.id; // Keep the ID reference
    }
    
    return profile;
  } catch (error) {
    console.error('Error in getGuestProfileByToken:', error);
    return null;
  }
}

/**
 * Save guest profile data to all relevant tables
 * This ensures data consistency across the guests, event_attendees tables
 */
export async function saveGuestProfile(profile: GuestProfile): Promise<{ success: boolean, error?: any }> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // Start a transaction by wrapping operations
    // First, update or create an entry in the guests table
    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .upsert({
        invitation_id: profile.invitation_id,
        event_id: profile.event_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        notes: profile.notes || null,
        avatar_url: profile.avatar_url || null,
        status: profile.status || 'registered',
        // Generate a UUID for access_token if it doesn't exist
        access_token: profile.id || crypto.randomUUID(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (guestError) {
      console.error('Error updating guest profile:', guestError);
      return { success: false, error: guestError };
    }
    
    // Next, update or create an entry in the event_attendees table
    const { data: attendeeData, error: attendeeError } = await supabase
      .from('event_attendees')
      .upsert({
        invitation_id: profile.invitation_id,
        event_id: profile.event_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        status: profile.status || 'confirmed',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (attendeeError) {
      console.error('Error updating attendee record:', attendeeError);
      return { success: false, error: attendeeError };
    }
    
    // Finally, check if we need to update the invitation's email if it has changed
    if (profile.email) {
      await supabase
        .from('invitations')
        .update({ email: profile.email })
        .eq('id', profile.invitation_id);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in saveGuestProfile:', error);
    return { success: false, error };
  }
}

/**
 * Get token from invitation ID
 */
export async function getTokenFromInvitationId(invitationId: string): Promise<string | null> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('token')
      .eq('id', invitationId)
      .single();
      
    if (error || !data) {
      console.error('Error getting token from invitation ID:', error);
      return null;
    }
    
    return data.token;
  } catch (error) {
    console.error('Error in getTokenFromInvitationId:', error);
    return null;
  }
}

/**
 * Check data consistency between tables and repair if needed
 * This is useful for diagnosing and fixing issues with existing data
 */
export async function checkAndRepairGuestConsistency(token: string): Promise<{
  success: boolean;
  checks: {
    invitation: boolean;
    attendee: boolean;
    guest: boolean;
    repairsNeeded: boolean;
    repairsSuccessful?: boolean;
  };
}> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // Get invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, email, name')
      .eq('token', token)
      .single();
      
    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return {
        success: false,
        checks: {
          invitation: false,
          attendee: false,
          guest: false,
          repairsNeeded: false
        }
      };
    }
    
    // Check if attendee exists
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select('id, name, email, phone')
      .eq('invitation_id', invitation.id)
      .eq('event_id', invitation.event_id);
      
    const attendeeExists = !attendeesError && attendees && attendees.length > 0;
    
    // Check if guest exists
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, name, email, phone')
      .eq('invitation_id', invitation.id)
      .eq('event_id', invitation.event_id);
      
    const guestExists = !guestsError && guests && guests.length > 0;
    
    // Check if repairs are needed
    const repairsNeeded = (attendeeExists && !guestExists) || (!attendeeExists && guestExists);
    
    // If repairs are needed, run a repair
    let repairsSuccessful = false;
    
    if (repairsNeeded) {
      console.log('Data inconsistency detected. Running repair...');
      
      if (attendeeExists && !guestExists) {
        // Need to create guest from attendee
        const attendee = attendees![0];
        
        const { error } = await supabase
          .from('guests')
          .insert({
            invitation_id: invitation.id,
            event_id: invitation.event_id,
            name: attendee.name || invitation.name,
            email: attendee.email || invitation.email,
            phone: attendee.phone,
            access_token: crypto.randomUUID(),
            status: 'registered',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        repairsSuccessful = !error;
      }
      
      if (!attendeeExists && guestExists) {
        // Need to create attendee from guest
        const guest = guests![0];
        
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            invitation_id: invitation.id,
            event_id: invitation.event_id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        repairsSuccessful = !error;
      }
    }
    
    return {
      success: true,
      checks: {
        invitation: true,
        attendee: attendeeExists,
        guest: guestExists,
        repairsNeeded,
        repairsSuccessful: repairsNeeded ? repairsSuccessful : undefined
      }
    };
  } catch (error) {
    console.error('Error in checkAndRepairGuestConsistency:', error);
    return {
      success: false,
      checks: {
        invitation: false,
        attendee: false,
        guest: false,
        repairsNeeded: false
      }
    };
  }
} 