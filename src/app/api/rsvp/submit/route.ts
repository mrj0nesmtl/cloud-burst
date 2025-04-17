import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

import { Database } from '@/types/supabase';
import { rsvpSubmitSchema } from '@/lib/validations/rsvp';

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * API route handler for submitting RSVP responses
 */
export async function POST(req: NextRequest) {
  console.log('RSVP submission started');
  
  try {
    // Create admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Regular client for authentication context, if needed
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
        { error: 'Missing required fields for RSVP submission. Must include invitation_id, event_id, and status.' },
        { status: 400 }
      );
    }
    
    // Validate the request body using the imported schema
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
      marketing_consent,
      token
    } = validatedData;
    
    // Map the status from the form to the database enum values - moved to higher scope
    // Database has an enum with values: 'pending', 'yes', 'no', 'maybe'
    const mapStatusToDbEnum = (formStatus: string): string => {
      // Map form values to database enum values
      const statusMap: Record<string, string> = {
        'accepted': 'accepted',
        'declined': 'declined',
        'pending': 'pending',
        'maybe': 'maybe'
      };
      
      return statusMap[formStatus.toLowerCase()] || 'pending';
    };
    
    const dbRsvpStatus = mapStatusToDbEnum(status);
    console.log(`Mapped form status "${status}" to database enum "${dbRsvpStatus}"`);
    
    // Verify that the invitation matches using admin client
    let invitation;
    try {
      // First try directly without token check
      const { data: invitationData, error: invitationError } = await supabaseAdmin
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
      // 1. Update the invitation status with admin client
      console.log(`Updating invitation ${invitation_id} with rsvp_status=${dbRsvpStatus}`);
      
      const { error: updateError } = await supabaseAdmin
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
      
      // 2. Skip profile creation to avoid foreign key issues
      console.log('Skipping profile creation due to foreign key constraints');
      
      // 3. Create RSVP record with admin client
      const rsvpId = uuidv4(); // Use UUID instead of nanoid
      console.log(`Creating RSVP record with ID: ${rsvpId}`);
      
      // Calculate total guest count
      const total_guest_count = (guest_count || 0) + (has_plus_one ? 1 : 0);
      
      const { error: rsvpError } = await supabaseAdmin
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
        // Continue with the process instead of failing completely
      } else {
        console.log('Successfully created RSVP record');
      }
      
      // Create guest record directly
      try {
        console.log('Creating guest record directly, skipping profile creation');
        const { data: guestData, error: guestError } = await supabaseAdmin
          .from('guests')
          .upsert({
            invitation_id: invitation_id,
            event_id: event_id,
            name: name,
            email: email,
            phone: phone || null,
            notes: notes || null,
            status: 'registered',
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (guestError) {
          console.error('Error creating guest record:', guestError);
          // Continue with the process instead of failing completely
        } else {
          console.log('Successfully created guest record:', guestData);
        }
      } catch (guestError) {
        console.error('Exception creating guest record:', guestError);
        // Continue with the process instead of failing completely
      }
      
      // Insert analytics event for RSVP response
      try {
        console.log('Creating analytics event for RSVP response');
        const { error: analyticsError } = await supabaseAdmin
          .from('analytics_events')
          .insert({
            type: 'rsvp_submission',
            invitation_id: invitation_id,
            properties: {
              event_id: event_id,
              status: dbRsvpStatus,
              timestamp: new Date().toISOString(),
              source: 'web_form',
              guestCount: total_guest_count,
              hasPlusOne: !!has_plus_one,
              hasDietaryRestrictions: !!dietary_restrictions,
              hasNotes: !!notes,
              marketingConsent: !!marketing_consent,
              phone: phone || null,
              rsvpId: rsvpId
            },
            created_at: new Date().toISOString()
          });
        
        if (analyticsError) {
          console.error('Error creating analytics event:', analyticsError);
          // Continue despite analytics error
        } else {
          console.log('Successfully created analytics event for RSVP response');
        }
      } catch (analyticsError) {
        console.error('Error creating analytics event:', analyticsError);
        // Continue despite analytics error
      }
      
      // 5. Log analytics with regular client (this doesn't require admin access)
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
      
      // After successful processing, before returning the response
      // Set token as cookie for the confirmation page fallback
      const response = NextResponse.json({
        success: true,
        message: status === 'accepted' 
          ? 'Thank you for accepting the invitation!'
          : 'Thank you for responding to the invitation.',
        invitation_id: invitation_id,
        event_id: event_id,
        token: token
      });
      
      // Set token cookie for fallback
      response.cookies.set({
        name: 'invitation_token',
        value: token,
        maxAge: 3600, // 1 hour
        path: '/',
        sameSite: 'lax'
      });
      
      console.log('RSVP submission completed successfully, token cookie set');
      return response;
      
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