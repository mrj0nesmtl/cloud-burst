import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { Database } from '@/types/supabase';
import { rsvpSchema } from '@/lib/validations/rsvp';

/**
 * API route handler for submitting RSVP responses
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();
    
    // Validate request body
    const { token, status, guestCount, dietaryRestrictions, notes, plusOne } = rsvpSchema.parse(body);
    
    // Find the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("id, name, email, event_id, metadata")
      .eq("token", token)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 404 }
      );
    }
    
    try {
      // Create or update RSVP record
      const { data: existingRsvp } = await supabase
        .from("rsvps")
        .select("id")
        .eq("invitation_id", invitation.id)
        .single();
      
      const rsvpData = {
        invitation_id: invitation.id,
        status,
        guest_count: guestCount,
        dietary_restrictions: dietaryRestrictions || null,
        notes: notes || null,
      };
      
      if (existingRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from("rsvps")
          .update(rsvpData)
          .eq("id", existingRsvp.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase
          .from("rsvps")
          .insert(rsvpData);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Cast metadata to appropriate type for safer access
      const metadata = invitation.metadata as Record<string, any> || {};
      
      // Update invitation status
      const { error: invUpdateError } = await supabase
        .from("invitations")
        .update({
          rsvp_status: status,
          rsvp_date: new Date().toISOString(),
          metadata: {
            ...metadata,
            plus_one_used: plusOne.used,
            plus_one_name: plusOne.name,
          },
        })
        .eq("id", invitation.id);
      
      if (invUpdateError) {
        throw invUpdateError;
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        status,
        message: status === "accepted" 
          ? "Thank you for accepting the invitation!" 
          : "Your response has been recorded.",
      });
    } catch (error) {
      console.error("RSVP submission error:", error);
      
      return NextResponse.json(
        { error: "Failed to process your RSVP" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("RSVP validation error:", error);
    
    return NextResponse.json(
      { error: "Invalid RSVP data" },
      { status: 400 }
    );
  }
} 