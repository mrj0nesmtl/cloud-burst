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
    
    // Verify that the token matches the invitation
    let invitation;
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('id, status, event_id')
        .eq('id', invitation_id)
        .eq('token', token)
        .single();
      
      if (error) {
        console.error('Error fetching invitation:', error);
        return NextResponse.json(
          { error: 'Failed to verify invitation' },
          { status: 500 }
        );
      }
      
      if (!data) {
        console.error('Invitation not found for token:', token);
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 404 }
        );
      }
      
      invitation = data;
      console.log('Found invitation:', JSON.stringify(invitation));
    } catch (error) {
      console.error('Exception fetching invitation:', error);
      return NextResponse.json(
        { error: 'Failed to verify invitation' },
        { status: 500 }
      );
    }
    
    // Verify that the event exists
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .eq('id', event_id)
        .single();
      
      if (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
          { error: 'Failed to verify event' },
          { status: 500 }
        );
      }
      
      if (!data) {
        console.error('Event not found:', event_id);
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      
      console.log('Found event:', JSON.stringify(data));
    } catch (error) {
      console.error('Exception fetching event:', error);
      return NextResponse.json(
        { error: 'Failed to verify event' },
        { status: 500 }
      );
    }
    
    // Update the invitation status - with proper rsvp_status field
    try {
      // Update invitation with proper rsvp_status and rsvp_date fields
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          rsvp_status: status, // Use rsvp_status instead of status
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
      
      console.log(`Successfully updated invitation rsvp_status (ID: ${invitation_id}) to: ${status}`);
    } catch (error) {
      console.error('Exception updating invitation status:', error);
      return NextResponse.json(
        { error: 'Failed to update invitation status' },
        { status: 500 }
      );
    }
    
    // Create or update RSVP details - focused on 'rsvps' table
    try {
      // Prepare RSVP data matching actual schema
      const rsvpData = {
        id: nanoid(),
        invitation_id,
        status,
        guest_count: guest_count || 0,
        dietary_restrictions: dietary_restrictions || null,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Attempt to insert RSVP data
      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(rsvpData);
      
      if (insertError) {
        console.error('Failed to insert RSVP details:', insertError);
        // Continue anyway - the invitation status update is more important
      } else {
        console.log('Successfully inserted RSVP details');
      }
    } catch (error) {
      console.error('Exception handling RSVP details:', error);
      // Continue anyway - the invitation status update is more important
    }
    
    // Log analytics for the RSVP
    try {
      await supabase.rpc('track_rsvp_submission', {
        p_event_id: event_id,
        p_invitation_id: invitation_id,
        p_status: status,
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