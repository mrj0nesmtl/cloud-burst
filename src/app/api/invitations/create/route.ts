import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { sendInvitationEmail } from '@/lib/sendgrid';
import type { EventWithOrganizer } from '@/types/events';
import type { Invitation, InvitationStatus, RsvpStatus } from '@/types/invitations';
import type { UserProfile } from '@/types/auth';

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = await createServerClient();
    const data = await request.json();

    // Get event details with organizer information
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          email,
          full_name
        )
      `)
      .eq('id', data.eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json(
        { error: eventError?.message || 'Event not found' },
        { status: 404 }
      );
    }

    // Convert the event data to the correct type
    const event = {
      ...eventData,
      start_date: eventData.date, // Use date as start_date
      organizer: eventData.organizer as unknown as UserProfile
    } as EventWithOrganizer;

    // Generate unique token for the invitation
    const token = nanoid();

    // Prepare metadata
    const metadata = {
      notes: data.notes,
      dietary_preferences: data.dietaryPreferences,
      plus_one_allowed: data.plusOne,
      plus_one_used: false,
      message: data.message
    };

    // Create invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        event_id: data.eventId,
        email: data.email,
        name: data.name,
        status: 'pending',
        rsvp_status: 'pending',
        token,
        metadata
      })
      .select()
      .single();

    if (invitationError || !invitationData) {
      console.error('Error creating invitation:', invitationError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Cast the invitation data to the correct type
    const invitation: Invitation = {
      ...invitationData,
      email: invitationData.email || '',
      name: invitationData.name,
      status: invitationData.status as InvitationStatus,
      rsvp_status: invitationData.rsvp_status as RsvpStatus,
      metadata
    };

    // Get host information from the event's organizer
    const hostName = event.organizer?.full_name || 'The Host';
    const hostEmail = event.organizer?.email || 'team@cloud-burst.app';

    // Prepare email data
    const emailData = {
      eventName: event.name,
      eventDate: new Date(event.date).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      eventLocation: event.location || 'TBD',
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
      recipientName: data.name,
      hostName,
      hostEmail,
      galleryLink: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${event.id}`
    };

    // Send invitation email
    await sendInvitationEmail(invitation, emailData);

    // Update invitation status to sent
    await supabase
      .from('invitations')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    return NextResponse.json({
      success: true,
      invitation
    });
  } catch (error) {
    console.error('Error in invitation creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 