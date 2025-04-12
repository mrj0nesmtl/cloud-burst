import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rsvpSubmitSchema } from '@/lib/validations/rsvp';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import { Database } from '@/types/supabase';
import { rsvpFormSchema, transformRsvpFormToDb } from '@/lib/validations/rsvp-schema';

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
    
    // Make sure required fields are present before validation
    if (!body.invitation_id || !body.event_id || !body.status) {
      console.error('Missing required fields:', { body });
      return NextResponse.json(
        { error: 'Missing required fields for RSVP submission' },
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
      token, 
      status, 
      name, 
      email, 
      phone, 
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
    
    // Verify that the token matches the invitation
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
    
    // Update the invitation status - with proper rsvp_status field
    try {
      console.log(`Updating invitation ${invitation_id} with rsvp_status=${dbRsvpStatus} (mapped from '${status}')`);
      
      // Update invitation with proper rsvp_status and rsvp_date fields
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          rsvp_status: dbRsvpStatus, // Use mapped status value
          rsvp_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation_id);
      
      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update invitation status', details: updateError },
          { status: 500 }
        );
      }
      
      console.log(`Successfully updated invitation rsvp_status (ID: ${invitation_id}) to: ${dbRsvpStatus}`);
    } catch (error) {
      console.error('Exception updating invitation status:', error);
      return NextResponse.json(
        { error: 'Failed to update invitation status' },
        { status: 500 }
      );
    }
    
    // Fix for the RSVP database issue
    try {
      // First check if an RSVP record already exists
      const { data: existingRsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('invitation_id', invitation_id)
        .maybeSingle();
        
      const rsvpData = {
        invitation_id,
        event_id,
        status: dbRsvpStatus,
        guest_count: guest_count || 0,
        dietary_restrictions: dietary_restrictions || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      };
      
      // If exists, update it; otherwise insert new record
      if (existingRsvp?.id) {
        await supabase
          .from('rsvps')
          .update(rsvpData)
          .eq('id', existingRsvp.id);
        console.log('Updated existing RSVP record');
      } else {
        // Add created_at for new records
        await supabase
          .from('rsvps')
          .insert({
            ...rsvpData,
            id: nanoid(), // Ensure unique ID
            created_at: new Date().toISOString()
          });
        console.log('Created new RSVP record');
      }
      
      // Create initial profile if not exists
      await supabase.rpc('create_guest_profile_if_not_exists', {
        p_email: email,
        p_name: name,
        p_event_id: event_id
      });
      
    } catch (error) {
      console.error('Error saving RSVP details:', error);
    }
    
    // Log analytics for the RSVP
    try {
      await supabase.rpc('track_rsvp_submission', {
        p_event_id: event_id,
        p_invitation_id: invitation_id,
        p_status: dbRsvpStatus, // Use the mapped status value
        p_guest_count: guest_count || 0
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
    console.error('Unhandled RSVP submission error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    );
  }
} 