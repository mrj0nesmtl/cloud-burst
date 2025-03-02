import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getTemplateById } from '@/lib/supabase/templates';

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = params.templateId;
    
    // First, try to get the template from the database
    try {
      const template = await getTemplateById(templateId);
      
      // If the template has HTML content stored in the database, return it
      if (template.html_content) {
        return new NextResponse(template.html_content, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
    } catch (error) {
      console.log('Template not found in database, trying file system');
    }
    
    // If not in database or no HTML content, try to read from file system
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
      const htmlContent = fs.readFileSync(templatePath, 'utf8');
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // If template not found, return 404
    return NextResponse.json(
      { error: `Template ${templateId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error serving template HTML:', error);
    return NextResponse.json(
      { error: 'Failed to serve template HTML' },
      { status: 500 }
    );
  }
} 