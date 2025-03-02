import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Define the Template interface
export interface Template {
  id?: string;
  template_id: string;
  name: string;
  type: 'email' | 'push' | 'sms';
  subject?: string;
  body: string;
  html_content?: string;
  active: boolean;
  last_updated?: string;
  synced_with_auth?: boolean;
  created_at?: string;
}

// Function to get all templates
export async function getTemplates() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('template_configurations')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
  
  return data as Template[];
}

// Function to get templates by type
export async function getTemplatesByType(type: 'email' | 'push' | 'sms') {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('template_configurations')
    .select('*')
    .eq('type', type)
    .order('name');
  
  if (error) {
    console.error(`Error fetching ${type} templates:`, error);
    throw error;
  }
  
  return data as Template[];
}

// Function to get a template by ID
export async function getTemplateById(templateId: string) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('template_configurations')
    .select('*')
    .eq('template_id', templateId)
    .single();
  
  if (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw error;
  }
  
  return data as Template;
}

// Function to update a template
export async function updateTemplate(template: Template) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('template_configurations')
    .update({
      name: template.name,
      subject: template.subject,
      body: template.body,
      html_content: template.html_content,
      active: template.active,
      last_updated: new Date().toISOString(),
      synced_with_auth: false // Mark as not synced with Auth
    })
    .eq('template_id', template.template_id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating template ${template.template_id}:`, error);
    throw error;
  }
  
  return data as Template;
}

// Function to create a new template
export async function createTemplate(template: Template) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('template_configurations')
    .insert({
      template_id: template.template_id,
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      html_content: template.html_content,
      active: template.active,
      synced_with_auth: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }
  
  return data as Template;
}

// Function to delete a template
export async function deleteTemplate(templateId: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from('template_configurations')
    .delete()
    .eq('template_id', templateId);
  
  if (error) {
    console.error(`Error deleting template ${templateId}:`, error);
    throw error;
  }
  
  return true;
}

// Function to sync a template with Supabase Auth
export async function syncTemplateWithAuth(templateId: string) {
  // This requires admin privileges, so we'll use a server-side function
  const response = await fetch(`/api/templates/sync?templateId=${templateId}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Error syncing template ${templateId} with Auth:`, error);
    throw new Error(error.message || 'Failed to sync template with Auth');
  }
  
  return await response.json();
}

// Function to get the HTML content of a template
export async function getTemplateHtml(templateId: string) {
  const response = await fetch(`/api/templates/${templateId}/html`);
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Error fetching HTML for template ${templateId}:`, error);
    throw new Error(error.message || 'Failed to fetch template HTML');
  }
  
  return await response.text();
} 