import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendInvitationEmail } from '@/lib/sendgrid';

export async function POST(request: NextRequest) {
  console.log('Processing invitation resend request');
  
  try {
    // Create a Supabase client with the cookies from the request
    const supabase = createServerComponentClient({ cookies });
    
    // Get user session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error('User not authenticated');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Parse the request body
    const { invitationId } = await request.json();

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*, events(name, date, location)')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to resend this invitation
    if (invitation.created_by !== userId) {
      const { data: isOrganizer } = await supabase
        .from('events')
        .select('id')
        .eq('id', invitation.event_id)
        .eq('created_by', userId)
        .single();
        
      if (!isOrganizer) {
        return NextResponse.json(
          { error: 'Not authorized to resend this invitation' },
          { status: 403 }
        );
      }
    }

    // Get host information
    const { data: hostProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', invitation.created_by)
      .single();

    const hostName = hostProfile?.full_name || 'Event Host';
    const hostEmail = hostProfile?.email || process.env.SENDGRID_FROM_EMAIL || '';
    
    // Format the event date
    const event = invitation.events;
    const formattedDate = event.date 
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'TBD';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${siteUrl}/invitation/${invitation.token}`;

    // Create the email data object
    const emailData = {
      eventName: event.name,
      eventDate: formattedDate,
      eventLocation: event.location || 'TBD',
      invitationLink: inviteUrl,
      recipientName: invitation.name || 'Guest',
      hostName: hostName,
      hostEmail: hostEmail,
      galleryLink: `${siteUrl}/events/${invitation.event_id}/gallery`,
      message: invitation.message || ''
    };

    console.log(`Resending invitation email to ${invitation.email}`);
    console.log(`Base site URL: ${siteUrl}`);
    console.log(`Invitation URL: ${inviteUrl}`);
    console.log(`Event ID: ${invitation.event_id}, Event Name: ${event.name}`);

    // Send the email
    const emailSent = await sendInvitationEmail(invitation, emailData);

    if (!emailSent) {
      console.error('Failed to send invitation email');
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    // Update the invitation with a new sent_at timestamp
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ 
        sent_at: new Date().toISOString(),
        status: 'pending' // Reset to pending if it was previously marked as failed
      })
      .eq('id', invitation.id);
    
    if (updateError) {
      console.warn('Failed to update invitation sent_at timestamp:', updateError);
      // Continue anyway since the email was sent
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 