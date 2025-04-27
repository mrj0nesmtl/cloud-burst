import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  event_id: z.string().uuid(),
  invitation_id: z.string().uuid(),
  status: z.string().optional(),
  newsletter_opt_in: z.boolean().optional(),
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Validate the input
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const profile = result.data;
    
    // First, update or create an entry in the guests table with RLS bypass
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
        access_token: body.id || crypto.randomUUID(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (guestError) {
      console.error('Error updating guest profile:', guestError);
      return NextResponse.json({ error: guestError.message }, { status: 500 });
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
      return NextResponse.json({ error: attendeeError.message }, { status: 500 });
    }
    
    // Finally, check if we need to update the invitation's email if it has changed
    if (profile.email) {
      await supabase
        .from('invitations')
        .update({ email: profile.email })
        .eq('id', profile.invitation_id);
    }
    
    return NextResponse.json({ success: true, data: guestData });
  } catch (error) {
    console.error('Error in guest profile update:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 