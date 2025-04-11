import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import type { EventWithOrganizer } from '@/types/events';
import type { Invitation, InvitationStatus, RsvpStatus } from '@/types/invitations';
import type { UserProfile } from '@/types/auth';
import { sendInvitationEmail } from '@/lib/sendgrid';
import { MailDataRequired } from '@sendgrid/mail';

// Set SendGrid API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will not work.');
}

export async function POST(request: NextRequest) {
  console.log('Processing invitation creation request');
  
  let supabase;
  try {
    // Create a Supabase client with the cookies from the request
    supabase = createServerComponentClient({ cookies });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body
    const { name, email, eventId, message } = await request.json();

    // Validate required fields
    if (!email || !eventId) {
      return NextResponse.json(
        { error: 'Email and eventId are required' },
        { status: 400 }
      );
    }

    // Get user session for tracking who created the invitation
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error('User not authenticated');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Generate a secure token for the invitation
    // Using standard UUID format without version prefix to avoid URL encoding issues
    const token = uuidv4();
    
    // For debugging - log the token format
    console.log('Generated invitation token:', {
      token,
      length: token.length,
      format: 'standard UUID v4'
    });

    // Environment variables check for debugging
    console.log('Environment variables check:');
    console.log(`- SENDGRID_API_KEY exists: ${!!process.env.SENDGRID_API_KEY}`);
    console.log(`- SENDGRID_FROM_EMAIL exists: ${!!process.env.SENDGRID_FROM_EMAIL}`);
    console.log(`- SENDGRID_TEMPLATE_ID exists: ${!!process.env.SENDGRID_TEMPLATE_ID}`);
    console.log(`- NEXT_PUBLIC_BASE_URL exists: ${!!process.env.NEXT_PUBLIC_BASE_URL}`);
    console.log(`- NEXT_PUBLIC_SITE_URL exists: ${!!process.env.NEXT_PUBLIC_SITE_URL}`);

    // Get event information to include in the invitation
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name, date, location')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Store the invitation in the database
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert({
        email,
        name,
        token,
        event_id: eventId,
        created_by: userId,
        message: message || null,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting invitation:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Verify that the invitation was actually stored in the database
    const { data: verifyData, error: verifyError } = await supabase
      .from('invitations')
      .select('id, token, status')
      .eq('token', token)
      .single();
    
    if (verifyError || !verifyData) {
      console.error('CRITICAL: Invitation verification failed after insert:', verifyError);
      console.error('Original token:', token);
      console.error('Original invitation data:', invitation);
      
      return NextResponse.json(
        { error: 'Failed to verify invitation in database' },
        { status: 500 }
      );
    }
    
    console.log('✅ Verified invitation in database:', {
      verifiedId: verifyData.id,
      verifiedToken: verifyData.token,
      originalToken: token,
      match: verifyData.token === token
    });

    // Attempt to send email, but allow the process to continue even if email fails
    let warning = null;
    try {
      // Format the event date
      const formattedDate = event.date 
        ? new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'TBD';

      // Critical fix: Use the invitation token from the database record
      // instead of generating a new one for the URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const inviteUrl = `${siteUrl}/invitation/${invitation.token}`;

      console.log('⚠️ Using database token for invitation link:', invitation.token);

      // Get host information
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      const hostName = hostProfile?.full_name || 'Event Host';
      const hostEmail = hostProfile?.email || process.env.SENDGRID_FROM_EMAIL || '';
      
      // Create the invitation and email data objects
      const emailData = {
        eventName: event.name,
        eventDate: formattedDate,
        eventLocation: event.location || 'TBD',
        invitationLink: inviteUrl,
        recipientName: name || 'Guest',
        hostName: hostName,
        hostEmail: hostEmail,
        galleryLink: `${siteUrl}/events/${eventId}/gallery`,
        message: message || ''
      };

      console.log(`Attempting to send invitation email to ${email}`);
      console.log(`Base site URL: ${siteUrl}`);
      console.log(`Invitation URL: ${inviteUrl}`);
      console.log(`Event ID: ${eventId}, Event Name: ${event.name}`);
      console.log(`Host details: ${hostName}, ${hostEmail}`);

      // Pass both required arguments to sendInvitationEmail
      const emailSent = await sendInvitationEmail(invitation, emailData);

      if (!emailSent) {
        warning = 'Invitation created but email could not be sent. The system will retry later.';
        console.warn(warning);
      } else {
        // Update the invitation with the sent timestamp if email was sent successfully
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invitation.id);
        
        if (updateError) {
          console.warn('Failed to update invitation sent_at timestamp:', updateError);
        }
      }
    } catch (emailError) {
      warning = 'Invitation created but email could not be sent. The system will retry later.';
      console.error('Error sending email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      invitation,
      warning // Include any warning in the response
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 