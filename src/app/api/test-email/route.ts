import { NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib';
import { Invitation } from '@/types/invitations';

export async function GET() {
  try {
    // Test invitation data
    const testInvitation: Invitation = {
      id: 'test-id-123',
      event_id: '4458ad61-b208-4034-ae06-45d097bdf081',
      email: 'joel.yaffe@gmail.com',
      name: 'Joel Yaffe',
      status: 'pending',
      rsvp_status: 'pending',
      token: 'test-token-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: null,
      expires_at: null,
      metadata: {
        notes: 'Test invitation',
        plus_one_allowed: true,
        plus_one_used: false
      }
    };

    // Test email data
    const testEmailData = {
      eventName: 'Cloud Burst Test Event',
      eventDate: 'March 20, 2024 at 7:00 PM',
      eventLocation: '123 Test Street, San Francisco, CA',
      invitationLink: 'https://cloud-burst.app/invite/test-token-123',
      recipientName: 'Joel Yaffe',
      hostName: 'Cloud Burst Team',
      hostEmail: 'team@cloud-burst.app',
      galleryLink: 'https://cloud-burst.app/gallery/test-event'
    };

    // Send test email
    await sendInvitationEmail(testInvitation, testEmailData);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 