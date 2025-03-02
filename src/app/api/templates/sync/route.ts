import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTemplateById, updateTemplate } from '@/lib/supabase/templates';
import fs from 'fs';
import path from 'path';

// Create a Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get the template ID from the query parameters
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    // Get the template from the database
    const template = await getTemplateById(templateId);
    
    if (!template) {
      return NextResponse.json(
        { error: `Template ${templateId} not found` },
        { status: 404 }
      );
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
        `${templateId}.html`
      );
      
      if (fs.existsSync(templatePath)) {
        htmlContent = fs.readFileSync(templatePath, 'utf8');
        
        // Update the template in the database with the HTML content
        template.html_content = htmlContent;
        await updateTemplate(template);
      } else {
        return NextResponse.json(
          { error: `HTML content for template ${templateId} not found` },
          { status: 404 }
        );
      }
    }
    
    // Map template IDs to Supabase Auth template types
    const templateTypeMap: Record<string, string> = {
      'confirm-signup': 'signup',
      'reset-password': 'recovery',
      'magic-link': 'magic_link',
      'change-email': 'email_change',
      'invite': 'invite'
    };
    
    const authTemplateType = templateTypeMap[templateId];
    
    if (!authTemplateType) {
      return NextResponse.json(
        { error: `Template ${templateId} is not a valid Auth template type` },
        { status: 400 }
      );
    }
    
    // Update the Auth template in Supabase using direct API call
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/templates/${authTemplateType}`,
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
        return NextResponse.json(
          { error: `Failed to update Auth template: ${errorData.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('Error updating Auth template:', error);
      return NextResponse.json(
        { error: `Failed to update Auth template: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Update the template in the database to mark it as synced
    await updateTemplate({
      ...template,
      synced_with_auth: true
    });
    
    return NextResponse.json({
      message: `Template ${templateId} successfully synced with Auth`,
      template: {
        ...template,
        synced_with_auth: true
      }
    });
  } catch (error: any) {
    console.error('Error syncing template with Auth:', error);
    return NextResponse.json(
      { error: `Failed to sync template with Auth: ${error.message}` },
      { status: 500 }
    );
  }
} 