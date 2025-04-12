import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import { Database } from '@/types/supabase';

/**
 * API route handler for submitting RSVP responses
 */
export async function POST(req: NextRequest) {
  console.log('RSVP submission started');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Define schema for RSVP submission
    const rsvpSubmitSchema = z.object({
      invitation_id: z.string().uuid(),
      event_id: z.string().uuid(),
      status: z.enum(['accepted', 'declined']),
      name: z.string().min(2, { message: "Full name is required" }),
      email: z.string().email({ message: "Valid email is required" }),
      phone: z.string().optional().nullable(),
      has_plus_one: z.boolean().optional().nullable(),
      plus_one_name: z.string().optional().nullable(),
      plus_one_email: z.string().email().optional().nullable(),
      guest_count: z.number().min(0).max(10).optional().nullable(),
      dietary_restrictions: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      marketing_consent: z.boolean().optional().nullable()
    });
    
    // Make sure required fields are present before validation
    if (!body.invitation_id || !body.event_id || !body.status) {
      console.error('Missing required fields:', { body });
      return NextResponse.json(
        { error: 'Missing required fields for RSVP submission. Must include invitation_id, event_id, and status.' },
        { status: 400 }
      );
    }
    
    // Validate the request body
    let validatedData;
    try {
      validatedData = rsvpSubmitSchema.parse(body);
      console.log('Validated data:', JSON.stringify(validatedData));
    } catch (error) {
      console.error('Validation error:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.format() },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    const { 
      invitation_id, 
      event_id,
      status, 
      name, 
      email, 
      phone, 
      has_plus_one,
      plus_one_name,
      plus_one_email,
      guest_count, 
      dietary_restrictions, 
      notes, 
      marketing_consent 
    } = validatedData;
    
    // Map the status from the form to the database enum values - moved to higher scope
    // Database has an enum with values: 'pending', 'yes', 'no', 'maybe'
    const mapStatusToDbEnum = (formStatus: string): string => {
      // Map form values to database enum values
      const statusMap: Record<string, string> = {
        'accepted': 'yes',
        'declined': 'no',
        'pending': 'pending',
        'maybe': 'maybe'
      };
      
      return statusMap[formStatus.toLowerCase()] || 'pending';
    };
    
    const dbRsvpStatus = mapStatusToDbEnum(status);
    console.log(`Mapped form status "${status}" to database enum "${dbRsvpStatus}"`);
    
    // Verify that the invitation matches
    let invitation;
    try {
      // First try directly without token check
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('id, status, rsvp_status, event_id')
        .eq('id', invitation_id)
        .single();
        
      if (invitationError || !invitationData) {
        console.error('Error fetching invitation by ID:', invitationError);
        return NextResponse.json(
          { error: 'Invitation not found', details: invitationError },
          { status: 404 }
        );
      }
      
      invitation = invitationData;
      console.log('Found invitation:', JSON.stringify(invitation));
      
      // Verify the event ID matches
      if (invitation.event_id !== event_id) {
        console.error('Event ID mismatch:', { invitationEventId: invitation.event_id, requestEventId: event_id });
        return NextResponse.json(
          { error: 'Event ID does not match invitation' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Exception fetching invitation:', error);
      return NextResponse.json(
        { error: 'Failed to verify invitation' },
        { status: 500 }
      );
    }
    
    // Process the RSVP - Create all necessary records in one transaction
    try {
      // 1. Update the invitation status
      console.log(`Updating invitation ${invitation_id} with rsvp_status=${dbRsvpStatus}`);
      
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          rsvp_status: dbRsvpStatus,
          rsvp_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plus_one_used: !!has_plus_one
        })
        .eq('id', invitation_id);
      
      if (updateError) {
        console.error('Error updating invitation:', updateError);
        return NextResponse.json(
          { error: 'Failed to update invitation', details: updateError },
          { status: 500 }
        );
      }
      
      // 2. Create or update profile
      let profileId;
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (existingProfile) {
        profileId = existingProfile.id;
        console.log(`Using existing profile: ${profileId}`);
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            full_name: name,
            role: 'guest',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else if (newProfile) {
          profileId = newProfile.id;
          console.log(`Created new profile: ${profileId}`);
        }
      }
      
      // 3. Create RSVP record
      const rsvpId = nanoid();
      console.log(`Creating RSVP record with ID: ${rsvpId}`);
      
      // Calculate total guest count
      const total_guest_count = (guest_count || 0) + (has_plus_one ? 1 : 0);
      
      const { error: rsvpError } = await supabase
        .from('rsvps')
        .insert({
          id: rsvpId,
          invitation_id: invitation_id,
          status: dbRsvpStatus,
          guest_count: total_guest_count,
          dietary_restrictions: dietary_restrictions || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (rsvpError) {
        console.error('Error creating RSVP record:', rsvpError);
      } else {
        console.log('Successfully created RSVP record');
      }
      
      // 4. Create event attendee record if accepted
      if (profileId && (dbRsvpStatus === 'yes' || dbRsvpStatus === 'accepted')) {
        console.log(`Creating event attendee record for profile: ${profileId}`);
        
        // Check if attendee record already exists
        const { data: existingAttendee } = await supabase
          .from('event_attendees')
          .select('id')
          .eq('event_id', event_id)
          .eq('profile_id', profileId)
          .maybeSingle();
        
        if (existingAttendee) {
          console.log(`Attendee record already exists: ${existingAttendee.id}`);
        } else {
          // Create new attendee record
          const { error: attendeeError } = await supabase
            .from('event_attendees')
            .insert({
              event_id: event_id,
              profile_id: profileId,
              created_at: new Date().toISOString()
            });
          
          if (attendeeError) {
            console.error('Error creating attendee record:', attendeeError);
          } else {
            console.log('Successfully created attendee record');
          }
        }
      }
      
      // 5. Log analytics
      try {
        await supabase.rpc('track_rsvp_submission', {
          p_event_id: event_id,
          p_invitation_id: invitation_id,
          p_status: dbRsvpStatus,
          p_guest_count: total_guest_count
        });
        console.log('Analytics tracking successful');
      } catch (err) {
        console.error('Analytics error:', err);
        // Continue despite analytics error
      }
      
      // Return success response
      console.log('RSVP submission completed successfully');
      return NextResponse.json({
        success: true,
        message: status === 'accepted' 
          ? 'Thank you for accepting the invitation!'
          : 'Thank you for responding to the invitation.'
      });
      
    } catch (error) {
      console.error('Error processing RSVP:', error);
      return NextResponse.json(
        { error: 'Failed to process RSVP' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled RSVP submission error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    );
  }
} 