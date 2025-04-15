import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for validating request body
const updateAvatarSchema = z.object({
  guest_id: z.string().uuid(),
  avatar_url: z.string().url()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedBody = updateAvatarSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validatedBody.error.format() },
        { status: 400 }
      );
    }
    
    const { guest_id, avatar_url } = validatedBody.data;
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Update the guest's avatar_url
    const { data, error } = await supabase
      .from('guests')
      .update({ avatar_url })
      .eq('id', guest_id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating avatar_url:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === '23505' ? 409 : 500 }
      );
    }
    
    // Return the updated guest
    return NextResponse.json({
      message: 'Avatar URL updated successfully',
      guest: data
    });
  } catch (error) {
    console.error('Error in avatar update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 