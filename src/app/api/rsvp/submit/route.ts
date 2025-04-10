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
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await req.json();
    
    // Validate the request body
    const validatedData = rsvpSubmitSchema.parse(body);
    
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
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, status, event_id')
      .eq('id', invitation_id)
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Verify that the event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', event_id)
      .single();
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Update the invitation status
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'responded',
        rsvp_status: status,
        rsvp_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation_id);
    
    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invitation status' },
        { status: 500 }
      );
    }
    
    // Log successful invitation update for debugging
    console.log(`Successfully updated invitation status (ID: ${invitation_id}) to: ${status}`);
    
    // Create or update RSVP details
    const { data: existingRsvp, error: rsvpFetchError } = await supabase
      .from('rsvp_details')
      .select('id')
      .eq('invitation_id', invitation_id)
      .single();
    
    const rsvpData = {
      name,
      email,
      phone: phone || null,
      guest_count,
      dietary_restrictions: dietary_restrictions || null,
      notes: notes || null,
      marketing_consent
    };
    
    let rsvpError;
    
    if (existingRsvp) {
      // Update existing RSVP details
      const { error } = await supabase
        .from('rsvp_details')
        .update(rsvpData)
        .eq('id', existingRsvp.id);
      
      rsvpError = error;
    } else {
      // Create new RSVP details
      const { error } = await supabase
        .from('rsvp_details')
        .insert({
          id: nanoid(),
          invitation_id,
          event_id,
          ...rsvpData
        });
      
      rsvpError = error;
    }
    
    if (rsvpError) {
      console.error('Error saving RSVP details:', rsvpError);
      return NextResponse.json(
        { error: 'Failed to save RSVP details' },
        { status: 500 }
      );
    }
    
    // Log analytics for the RSVP
    try {
      await supabase.rpc('track_rsvp_submission', {
        p_event_id: event_id,
        p_invitation_id: invitation_id,
        p_status: status,
        p_guest_count: guest_count
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
    
    return NextResponse.json({
      success: true,
      message: status === 'accepted' 
        ? 'Thank you for accepting the invitation!'
        : 'Thank you for responding to the invitation.'
    });
  } catch (error) {
    console.error('RSVP submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    );
  }
} 