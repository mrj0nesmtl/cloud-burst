import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import { sendInvitationEmail } from '@/lib/sendgrid';
import Papa from 'papaparse';
import type { Database } from '@/types/supabase';
import type { Invitation } from '@/types/invitations';
import { EventWithOrganizer } from '@/types/events';
import { UserProfile } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = formData.get('eventId') as string;
    const csvFile = formData.get('csvFile') as File;
    const message = formData.get('message') as string;
    const plusOne = formData.get('plusOne') === 'true';

    if (!eventId || !csvFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get event details
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
      .eq('id', eventId)
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

    // Parse CSV file
    const csvText = await csvFile.text();
    const { data: csvData } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    // Process each row
    const results = await Promise.all(
      csvData.map(async (row: any) => {
        try {
          // Generate unique token
          const token = nanoid();

          // Create invitation record
          const { data: invitation, error: invitationError } = await supabase
            .from('invitations')
            .insert({
              event_id: eventId,
              email: row.email,
              name: row.name,
              status: 'pending',
              rsvp_status: 'pending',
              token,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              metadata: {
                notes: row.notes,
                dietary_preferences: row.dietary_preferences,
                plus_one_allowed: plusOne,
                plus_one_used: false,
                message
              }
            })
            .select()
            .single();

          if (invitationError || !invitation) {
            throw invitationError || new Error('Failed to create invitation');
          }

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
            recipientName: row.name,
            hostName,
            hostEmail,
            galleryLink: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${event.id}`
          };

          // Send invitation email
          await sendInvitationEmail(invitation as Invitation, emailData);

          // Update invitation status to sent
          const { error: updateError } = await supabase
            .from('invitations')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

          if (updateError) {
            throw updateError;
          }

          return {
            success: true,
            email: row.email,
            name: row.name,
            invitation
          };
        } catch (error) {
          return {
            success: false,
            email: row.email,
            name: row.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r: { success: boolean }) => r.success).length;
    const failed = results.filter((r: { success: boolean }) => !r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    console.error('Error in bulk invitation creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 