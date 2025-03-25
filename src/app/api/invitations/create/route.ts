import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { createGuestAccount, generateGuestLoginLink } from '@/lib/supabase/auth-utils';
import type { EventWithOrganizer } from '@/types/events';
import type { Invitation, InvitationStatus, RsvpStatus } from '@/types/invitations';
import type { UserProfile } from '@/types/auth';
import { sendInvitationEmail } from '@/lib/sendgrid';
import { MailDataRequired } from '@sendgrid/mail';

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      eventId, 
      name, 
      email, 
      message, 
      plusOne = false, 
      dietaryPreferences = '', 
      notes = '' 
    } = body;

    // Validate required fields
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Initialize Supabase client with cookies for auth
    const cookieStore = cookies();
    const supabase = await createClient();

    // Get user session for tracking who created the invitation
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Generate a secure token for the invitation
    const token = crypto.randomBytes(32).toString('hex');

    // Create the invitation metadata
    const metadata = {
      message: message || '',
      dietary_preferences: dietaryPreferences || '',
      notes: notes || '',
    };

    // Insert invitation record
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        event_id: eventId,
        name,
        email,
        token,
        status: 'pending',
        metadata,
        plus_one_allowed: plusOne,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' }, 
        { status: 500 }
      );
    }

    // Get event details for the email
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name, date, location')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json(
        { error: 'Failed to fetch event details' }, 
        { status: 500 }
      );
    }

    // Construct the invitation URL with token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cloudburst.app';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Get user profile for sender name
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const organizerName = userProfile?.full_name || 'The Event Organizer';

    // Create email content - properly typed as MailDataRequired
    const emailContent: MailDataRequired = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@cloudburst.app',
        name: 'Cloud Burst',
      },
      templateId: process.env.SENDGRID_INVITATION_TEMPLATE_ID!,
      dynamicTemplateData: {
        invitee_name: name,
        event_name: event.name,
        event_date: new Date(event.date).toLocaleDateString(),
        event_location: event.location || 'TBA',
        custom_message: message || '',
        invitation_url: inviteUrl,
        organizer_name: organizerName,
      },
      subject: `You're invited to ${event.name}`,  // Add subject field
    };

    try {
      // Send the email
      await sgMail.send(emailContent);
      
      // Update the invitation with sent timestamp
      await supabase
        .from('invitations')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', invitation.id);
      
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      return NextResponse.json(
        { 
          warning: 'Invitation created but email could not be sent',
          invitation: invitation.id
        }, 
        { status: 201 }
      );
    }

    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      invitation: invitation.id 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Unhandled error in create invitation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 