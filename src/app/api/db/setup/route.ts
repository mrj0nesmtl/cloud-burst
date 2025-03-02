import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Create a Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Check for a secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const authToken = searchParams.get('token');
    
    if (authToken !== process.env.SETUP_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Step 1: Create the template_configurations table
    const { error: createTableError } = await supabaseAdmin.rpc('create_template_table');
    
    if (createTableError) {
      console.error('Error creating template table:', createTableError);
      return NextResponse.json(
        { error: `Failed to create template table: ${createTableError.message}` },
        { status: 500 }
      );
    }
    
    // Step 2: Check the structure of the profiles table to find the user ID column
    const { data: profilesColumns, error: profilesError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .in('column_name', ['user_id', 'id']);
    
    if (profilesError) {
      console.error('Error checking profiles table structure:', profilesError);
      return NextResponse.json(
        { error: `Failed to check profiles table structure: ${profilesError.message}` },
        { status: 500 }
      );
    }
    
    // Determine the user ID column name
    const userIdColumn = profilesColumns && profilesColumns.length > 0
      ? profilesColumns[0].column_name
      : 'id'; // Default to 'id' if we can't determine
    
    console.log(`Using user ID column: ${userIdColumn}`);
    
    // Step 3: Drop existing policies and create new ones
    const { error: dropPoliciesError } = await supabaseAdmin.rpc('drop_template_policies');
    
    if (dropPoliciesError) {
      console.error('Error dropping template policies:', dropPoliciesError);
      return NextResponse.json(
        { error: `Failed to drop template policies: ${dropPoliciesError.message}` },
        { status: 500 }
      );
    }
    
    // Create read policy
    const { error: createReadPolicyError } = await supabaseAdmin.rpc('create_template_read_policy');
    
    if (createReadPolicyError) {
      console.error('Error creating read policy:', createReadPolicyError);
      return NextResponse.json(
        { error: `Failed to create read policy: ${createReadPolicyError.message}` },
        { status: 500 }
      );
    }
    
    // Create admin policy with the correct user ID column
    const { error: createAdminPolicyError } = await supabaseAdmin.rpc('create_template_admin_policy', {
      user_id_column: userIdColumn
    });
    
    if (createAdminPolicyError) {
      console.error('Error creating admin policy:', createAdminPolicyError);
      return NextResponse.json(
        { error: `Failed to create admin policy: ${createAdminPolicyError.message}` },
        { status: 500 }
      );
    }
    
    // Step 4: Insert default email templates if they don't exist
    const defaultTemplates = [
      {
        template_id: 'confirm-signup',
        name: 'Confirm Sign Up',
        type: 'email',
        subject: 'Confirm your signup',
        body: 'Please confirm your signup by clicking the link: {{ .ConfirmationURL }}',
        active: true
      },
      {
        template_id: 'reset-password',
        name: 'Reset Password',
        type: 'email',
        subject: 'Reset your password',
        body: 'Reset your password by clicking the link: {{ .SiteURL }}/auth/reset-password#token={{ .Token }}',
        active: true
      },
      {
        template_id: 'magic-link',
        name: 'Magic Link',
        type: 'email',
        subject: 'Your magic link',
        body: 'Click the link to log in: {{ .SiteURL }}/auth/callback?token={{ .Token }}',
        active: true
      },
      {
        template_id: 'change-email',
        name: 'Change Email',
        type: 'email',
        subject: 'Confirm your email change',
        body: 'Confirm your email change by clicking the link: {{ .ConfirmationURL }}',
        active: true
      },
      {
        template_id: 'invite',
        name: 'Invite',
        type: 'email',
        subject: 'You have been invited',
        body: 'You have been invited. Accept the invite by clicking the link: {{ .SiteURL }}/auth/invite#token={{ .Token }}',
        active: true
      }
    ];
    
    // Insert templates one by one
    for (const template of defaultTemplates) {
      // Check if template already exists
      const { data: existingTemplate, error: checkError } = await supabaseAdmin
        .from('template_configurations')
        .select('id')
        .eq('template_id', template.template_id)
        .single();
      
      if (checkError && !checkError.message.includes('No rows found')) {
        console.error(`Error checking template ${template.template_id}:`, checkError);
        continue; // Skip this template but continue with others
      }
      
      if (!existingTemplate) {
        // Template doesn't exist, insert it
        const { error: insertError } = await supabaseAdmin
          .from('template_configurations')
          .insert([template]);
        
        if (insertError) {
          console.error(`Error inserting template ${template.template_id}:`, insertError);
          continue; // Skip this template but continue with others
        }
        
        console.log(`Inserted template: ${template.template_id}`);
      } else {
        console.log(`Template already exists: ${template.template_id}`);
      }
    }
    
    // Step 5: Load HTML content from files and update templates
    try {
      const templatesDir = path.join(process.cwd(), 'src', 'emails');
      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.html')) {
          const templateId = file.replace('.html', '');
          const filePath = path.join(templatesDir, file);
          
          try {
            const htmlContent = await fs.readFile(filePath, 'utf8');
            
            // Update the template with HTML content
            const { error: updateError } = await supabaseAdmin
              .from('template_configurations')
              .update({ html_content: htmlContent, last_updated: new Date().toISOString() })
              .eq('template_id', templateId);
            
            if (updateError) {
              console.error(`Error updating HTML content for ${templateId}:`, updateError);
              continue;
            }
            
            console.log(`Updated HTML content for template: ${templateId}`);
          } catch (fileError: any) {
            console.error(`Error reading HTML file ${file}:`, fileError);
          }
        }
      }
    } catch (dirError: any) {
      console.error('Error reading templates directory:', dirError);
      // Continue execution even if we can't read the templates directory
    }
    
    return NextResponse.json({
      message: 'Database setup completed successfully',
      steps: {
        create_table: true,
        user_id_column: userIdColumn,
        policies: {
          drop: true,
          read: true,
          admin: true
        },
        templates_inserted: true,
        html_content_updated: true
      }
    });
  } catch (error: any) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: `Failed to set up database: ${error.message}` },
      { status: 500 }
    );
  }
} 