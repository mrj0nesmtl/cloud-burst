import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Magic link request schema
const magicLinkSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  invitationToken: z.string().optional(),
  redirectUrl: z.string().url({ message: "Invalid redirect URL" })
})

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Parse and validate request
    const body = await request.json()
    const { email, invitationToken, redirectUrl } = magicLinkSchema.parse(body)
    
    console.log('Magic link request:', { email, invitationToken, redirectUrl })
    
    // If invitation token is provided, validate it
    if (invitationToken) {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('id, email, token, status')
        .eq('token', invitationToken)
        .single()
      
      if (error || !invitation) {
        console.error('Invalid invitation token:', error)
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 400 }
        )
      }
      
      // Check if email matches invitation
      // Note: We allow different emails to accommodate plus-one guests
      // or cases where the user wants to use a different email
      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        console.log(`Email mismatch: invitation email ${invitation.email} vs. provided email ${email}`)
        // We don't return an error here to avoid revealing which emails have invitations
        // Instead, we'll just log this information
      }
      
      // Check if invitation is expired or cancelled
      if (invitation.status === 'expired' || invitation.status === 'cancelled') {
        return NextResponse.json(
          { error: 'This invitation has expired or been cancelled' },
          { status: 400 }
        )
      }
    }
    
    // Format the redirect URL with the invitation token if provided
    let finalRedirectUrl = redirectUrl
    if (invitationToken) {
      // Make sure to handle URLs with existing query parameters
      const separator = redirectUrl.includes('?') ? '&' : '?'
      finalRedirectUrl = `${redirectUrl}${separator}invitation_token=${invitationToken}`
    }
    
    // Send magic link using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: finalRedirectUrl,
        // Set data in the user's JWT claims to indicate they came from an invitation
        data: invitationToken ? {
          invitation_token: invitationToken,
          source: 'invitation'
        } : undefined
      }
    })
    
    if (error) {
      console.error('Error sending magic link:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Update invitation if token was provided
    if (invitationToken) {
      // Update the invitation status to indicate the email was opened
      await supabase
        .from('invitations')
        .update({
          status: 'opened',
          updated_at: new Date().toISOString()
        })
        .eq('token', invitationToken)
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Magic link sent successfully',
        // Add tracking info for analytics
        data: {
          email,
          sentAt: new Date().toISOString(),
          hasInvitation: !!invitationToken
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Magic link error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 