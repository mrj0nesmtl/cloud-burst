import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { RsvpFormValues, InvitationMetadata } from '@/types/rsvp';
import { rsvpFormSchema, formValuesToRsvpInsert } from '@/lib/validation/rsvp.schema';

/**
 * API route handler for submitting RSVP responses
 */
export async function POST(request: NextRequest) {
  try {
    // Extract token from request body
    const body = await request.json();
    const { token, ...formData } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }
    
    // Validate form data with Zod
    const validationResult = rsvpFormSchema.safeParse(formData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid form data',
          issues: validationResult.error.issues
        },
        { status: 400 }
      );
    }
    
    const formValues = validationResult.data as RsvpFormValues;
    
    // Initialize Supabase server client
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    
    // Look up the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, email, name, status, expires_at, metadata')
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      console.error('Invitation lookup error:', invitationError);
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Check if invitation is valid and not expired
    const now = new Date();
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
    
    if (
      invitation.status === 'expired' || 
      (expiresAt && now > expiresAt)
    ) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }
    
    // Check if there's an existing RSVP for this invitation
    const { data: existingRsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('invitation_id', invitation.id)
      .maybeSingle();
    
    let rsvpResponse;
    
    // Convert form values to database format
    const rsvpData = formValuesToRsvpInsert(formValues, invitation.id);
    
    // Update or insert RSVP based on whether one already exists
    if (existingRsvp) {
      // Update existing RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .update(rsvpData)
        .eq('id', existingRsvp.id)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error updating RSVP:', error);
        return NextResponse.json(
          { error: 'Failed to update RSVP' },
          { status: 500 }
        );
      }
      
      rsvpResponse = data;
    } else {
      // Insert new RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .insert(rsvpData)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating RSVP:', error);
        return NextResponse.json(
          { error: 'Failed to create RSVP' },
          { status: 500 }
        );
      }
      
      rsvpResponse = data;
    }
    
    // Cast metadata to the correct type for accessing plus_one properties
    const metadata = invitation.metadata as unknown as InvitationMetadata;
    
    // Update invitation metadata with plus one usage if applicable
    if (formValues.plusOne) {
      await supabase
        .from('invitations')
        .update({
          metadata: {
            ...(metadata || {}),
            plus_one_used: true,
            plus_one_name: formValues.plusOneName
          }
        })
        .eq('id', invitation.id);
    }
    
    // Update invitation status based on RSVP response
    await supabase
      .from('invitations')
      .update({
        rsvp_status: formValues.status,
        rsvp_date: new Date().toISOString()
      })
      .eq('id', invitation.id);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: formValues.status === 'accepted' 
        ? 'Thank you for accepting the invitation!' 
        : 'Thank you for your response.',
      rsvp: rsvpResponse
    });
    
  } catch (error) {
    console.error('RSVP submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process RSVP submission' },
      { status: 500 }
    );
  }
} 