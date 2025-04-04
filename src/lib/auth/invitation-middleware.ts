import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to handle invitation tokens in authentication flow
 * This function stores the invitation token in the user's metadata when they sign in
 */
export async function handleInvitationToken(req: NextRequest, res: NextResponse) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const url = new URL(req.url)
  
  // Check for invitation token in query params
  const invitationToken = url.searchParams.get('invitation_token')
  
  if (invitationToken) {
    console.log('Found invitation token in URL:', invitationToken)
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Set invitation token in user metadata
        await supabase.auth.updateUser({
          data: {
            invitation_token: invitationToken,
            source: 'invitation'
          }
        })
        
        console.log('Updated user metadata with invitation token')
        
        // Fetch the invitation to mark it as opened
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, email, status')
          .eq('token', invitationToken)
          .single()
        
        if (!invitationError && invitation) {
          // Update invitation status to opened if not already responded to
          if (invitation.status === 'pending' || invitation.status === 'sent') {
            await supabase
              .from('invitations')
              .update({
                status: 'opened',
                updated_at: new Date().toISOString()
              })
              .eq('token', invitationToken)
            
            console.log('Updated invitation status to opened')
          }
          
          // Set RLS policies helper value for the invitation
          await (supabase as any).rpc('set_invitation_token', {
            token: invitationToken
          })
        }
        
        // Remove token from URL to prevent repeated processing
        url.searchParams.delete('invitation_token')
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error processing invitation token:', error)
    }
  }
  
  return res
}

/**
 * Check if a user has access to an invitation
 */
export async function hasInvitationAccess(userId: string, invitationToken: string) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user has this invitation token in their metadata
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.user_metadata?.invitation_token === invitationToken) {
    return true
  }
  
  // Check if user is the owner of the invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('created_by, event_id, events(organizer_id)')
    .eq('token', invitationToken)
    .single()
  
  if (invitation) {
    // User is either the creator of the invitation or the event organizer
    if (invitation.created_by === userId || invitation.events?.[0]?.organizer_id === userId) {
      return true
    }
  }
  
  return false
} 