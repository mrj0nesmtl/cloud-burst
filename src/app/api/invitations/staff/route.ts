import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const staffInvitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(['event_host', 'event_staff']),
  permissions: z.array(z.string()).optional(),
  message: z.string().optional(),
  eventId: z.string().uuid("Invalid event ID")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, eventId, role, message } = body;
    
    // Validate input with Zod
    const inputSchema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
      eventId: z.string().uuid(),
      role: z.string(),
      message: z.string().optional(),
    });
    
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to invite staff
    const { data: permission } = await supabase
      .from('event_permissions')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', session.user.id)
      .single();
      
    if (!permission || !['organizer', 'admin', 'super_admin', 'event_host'].includes(permission.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to invite staff to this event' },
        { status: 403 }
      );
    }
    
    // Determine staff type based on role
    const internalRoles = ['event_host', 'event_staff'];
    const externalRoles = ['contractor', 'photographer', 'technician', 'marketing'];
    
    const staffType = internalRoles.includes(role) ? 'internal' : 'external';
    
    // Create invitation token
    const token = nanoid(32);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Token expires in 7 days
    
    // Insert invitation record
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        email,
        name,
        event_id: eventId,
        invited_by: session.user.id,
        token,
        expires_at: expires.toISOString(),
        status: 'sent',
        role_type: role,
        message: message || null,
        staff_type: staffType
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
    
    // Send invitation email
    try {
      await sendStaffInvitationEmail({
        email,
        name: name || email,
        eventId,
        token,
        role,
        inviterName: session.user.email || 'Unknown Inviter',
        staffType,
        message: message || undefined
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Continue even if email fails, we can resend later
    }
    
    return NextResponse.json({ success: true, invitation });
    
  } catch (error) {
    console.error('Staff invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}

async function sendStaffInvitationEmail({
  email,
  name,
  eventId,
  token,
  role,
  inviterName,
  staffType,
  message
}: {
  email: string;
  name: string;
  eventId: string;
  token: string;
  role: string;
  inviterName: string;
  staffType: string;
  message?: string;
}) {
  // For now, we'll just log this - you can implement the actual email sending later
  console.log(`Sending staff invitation email to ${email} for role ${role}`);
  
  // In a production environment, you would call your email service here
  // For example:
  // return await sendEmail({
  //   to: email,
  //   subject: `You've been invited to join an event as ${role}`,
  //   template: 'staff-invitation',
  //   data: { name, eventId, token, role, inviterName, staffType, message }
  // });
  
  // Simulate successful email sending
  return true;
}
