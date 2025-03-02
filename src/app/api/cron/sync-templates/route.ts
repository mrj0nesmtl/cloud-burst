import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTemplates, updateTemplate } from '@/lib/supabase/templates';
import fs from 'fs';
import path from 'path';

// Create a Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Map template IDs to Supabase Auth template types
const templateTypeMap: Record<string, string> = {
  'confirm-signup': 'signup',
  'reset-password': 'recovery',
  'magic-link': 'magic_link',
  'change-email': 'email_change',
  'invite': 'invite'
};

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (you can use a secret token)
    const { searchParams } = new URL(request.url);
    const authToken = searchParams.get('token');
    
    if (authToken !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all templates that need to be synced
    const templates = await getTemplates();
    const templatesToSync = templates.filter(
      template => !template.synced_with_auth && template.active && template.type === 'email'
    );
    
    if (templatesToSync.length === 0) {
      return NextResponse.json({
        message: 'No templates to sync',
        synced: 0
      });
    }
    
    const results = [];
    
    // Sync each template
    for (const template of templatesToSync) {
      // Skip templates that don't map to Supabase Auth templates
      if (!templateTypeMap[template.template_id]) {
        continue;
      }
      
      // Get the HTML content
      let htmlContent = template.html_content;
      
      // If no HTML content in the database, try to read from file system
      if (!htmlContent) {
        const templatePath = path.join(
          process.cwd(),
          'src',
          'app',
          'protected',
          'settings',
          'notifications',
          'templates',
          `${template.template_id}.html`
        );
        
        if (fs.existsSync(templatePath)) {
          htmlContent = fs.readFileSync(templatePath, 'utf8');
          
          // Update the template in the database with the HTML content
          template.html_content = htmlContent;
        } else {
          results.push({
            template_id: template.template_id,
            success: false,
            error: 'HTML content not found'
          });
          continue;
        }
      }
      
      try {
        // Update the Auth template in Supabase using the correct method
        // For Supabase JS v2, we need to use a different approach
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/templates/${templateTypeMap[template.template_id]}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              template: htmlContent,
              subject: template.subject || ''
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          results.push({
            template_id: template.template_id,
            success: false,
            error: errorData.message || 'Failed to update template'
          });
          continue;
        }
      } catch (error: any) {
        results.push({
          template_id: template.template_id,
          success: false,
          error: error.message || 'Failed to update template'
        });
        continue;
      }
      
      // Update the template in the database to mark it as synced
      await updateTemplate({
        ...template,
        synced_with_auth: true
      });
      
      results.push({
        template_id: template.template_id,
        success: true
      });
    }
    
    return NextResponse.json({
      message: 'Templates synced successfully',
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error: any) {
    console.error('Error syncing templates with Auth:', error);
    return NextResponse.json(
      { error: `Failed to sync templates with Auth: ${error.message}` },
      { status: 500 }
    );
  }
} 