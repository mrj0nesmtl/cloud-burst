import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { Database } from "@/types/supabase";

const statusRequestSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

/**
 * API route handler for getting RSVP status information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const token = request.nextUrl.searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        { error: "Missing invitation token" },
        { status: 400 }
      );
    }
    
    // Validate token
    const parsedParams = statusRequestSchema.safeParse({ token });
    
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
    
    // Find the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("id, name, email, event_id, status, rsvp_status, rsvp_date, metadata")
      .eq("token", token)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 404 }
      );
    }
    
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, description, date, location")
      .eq("id", invitation.event_id)
      .single();
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: "Failed to retrieve event details" },
        { status: 500 }
      );
    }
    
    // Get RSVP details if available
    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("id, status, guest_count, dietary_restrictions, notes, created_at")
      .eq("invitation_id", invitation.id)
      .maybeSingle();
    
    // Cast metadata to appropriate type for safer access
    const metadata = invitation.metadata as Record<string, any> || {};
    
    return NextResponse.json({
      status: "success",
      invitation: {
        name: invitation.name,
        email: invitation.email,
        status: invitation.status,
        rsvp_status: invitation.rsvp_status,
        rsvp_date: invitation.rsvp_date,
        plus_one: {
          available: metadata.plus_one_enabled || false,
          used: metadata.plus_one_used || false,
          name: metadata.plus_one_name || null,
        },
      },
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date,
        location: event.location,
      },
      rsvp: rsvp ? {
        status: rsvp.status,
        guest_count: rsvp.guest_count,
        dietary_restrictions: rsvp.dietary_restrictions,
        notes: rsvp.notes,
        created_at: rsvp.created_at,
      } : null,
    });
  } catch (error) {
    console.error("Error checking RSVP status:", error);
    
    return NextResponse.json(
      { error: "Failed to retrieve RSVP status" },
      { status: 500 }
    );
  }
} 