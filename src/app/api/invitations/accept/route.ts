import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  userId: z.string().uuid("Invalid user ID")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request
    const result = acceptInvitationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { token, userId } = result.data;
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*, event:event_id(id, name, organizer_id)')
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }
    
    // Check if invitation has already been used
    if (invitation.status === 'used') {
      return NextResponse.json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to start transaction' },
        { status: 500 }
      );
    }
    
    try {
      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'used',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      if (updateError) throw updateError;
      
      // Check if this is a staff invitation
      const isStaffInvitation = invitation.role_type === 'event_host' || invitation.role_type === 'event_staff';
      
      if (isStaffInvitation) {
        // Create event_staff record
        const { error: staffError } = await supabase
          .from('event_staff')
          .insert({
            event_id: invitation.event_id,
            user_id: userId,
            role: invitation.role_type,
            permissions: invitation.metadata?.permissions || [],
            invited_by: invitation.event.organizer_id,
            status: 'active'
          });
        
        if (staffError) throw staffError;
        
        // Add user to appropriate role in profiles if needed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        
        // Only update the role if user doesn't already have a higher-level role
        const existingRole = profile?.role || 'user';
        const needsRoleUpdate = (
          (invitation.role_type === 'event_host' && existingRole === 'user') || 
          (invitation.role_type === 'event_staff' && existingRole === 'user')
        );
        
        if (needsRoleUpdate) {
          const { error: roleUpdateError } = await supabase
            .from('profiles')
            .update({
              role: invitation.role_type === 'event_host' ? 'event_host' : 'event_staff',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (roleUpdateError) throw roleUpdateError;
        }
      } else {
        // Regular guest invitation - create event_attendee record
        const { error: attendeeError } = await supabase
          .from('event_attendees')
          .insert({
            event_id: invitation.event_id,
            user_id: userId,
            invitation_id: invitation.id,
            name: invitation.name || '',
            email: invitation.email || '',
            status: 'confirmed'
          });
        
        if (attendeeError) throw attendeeError;
      }
      
      // Add gallery permissions for the user
      const { error: permissionError } = await supabase
        .from('gallery_permissions')
        .insert({
          event_id: invitation.event_id,
          user_id: userId,
          permission_level: isStaffInvitation ? 'manage' : 'view', 
          can_upload: true,
          can_download: isStaffInvitation
        });
      
      if (permissionError) throw permissionError;
      
      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) throw commitError;
      
      return NextResponse.json({
        success: true,
        event_id: invitation.event_id,
        event_name: invitation.event.name,
        role: invitation.role_type || 'guest'
      });
      
    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction');
      throw error;
    }
    
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
} 