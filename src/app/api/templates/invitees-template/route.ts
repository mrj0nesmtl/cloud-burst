import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * API route for generating and downloading a CSV template for bulk invitee upload
 * Restricted to organizers and super admins
 */
export async function GET(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createServerComponentClient<Database>({ cookies });

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions (must be organizer or admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Only allow organizers and super_admin roles
    if (!['organizer', 'super_admin', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Template content
    const csvTemplate = 'name,email,dietary_preferences,notes\nJohn Doe,john@example.com,vegetarian,VIP guest\nJane Smith,jane@example.com,gluten-free,Regular guest';
    
    // File name
    const fileName = 'invitees-template.csv';
    
    // Define the storage path
    const storagePath = `templates/${fileName}`;
    
    // Check if the template already exists
    const { data: existingFile } = await supabase
      .storage
      .from('public')
      .list('templates', {
        search: fileName
      });
    
    // If template doesn't exist or we're forcing an update, upload it
    if (!existingFile || existingFile.length === 0) {
      // Convert the CSV string to a Blob
      const blob = new Blob([csvTemplate], { type: 'text/csv' });
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload(storagePath, blob, {
          contentType: 'text/csv',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading template:', uploadError);
        return NextResponse.json(
          { error: 'Failed to create template' },
          { status: 500 }
        );
      }
    }
    
    // Get the public URL for the template
    const { data: { publicUrl } } = supabase
      .storage
      .from('public')
      .getPublicUrl(storagePath);
    
    // Return the file URL and download info
    return NextResponse.json({
      success: true,
      template: {
        name: fileName,
        url: publicUrl,
        contentType: 'text/csv'
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 