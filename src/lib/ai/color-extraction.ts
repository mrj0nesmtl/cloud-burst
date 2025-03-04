import { createClient } from '@supabase/supabase-js';

export async function extractColorsFromImage(imageFile: File): Promise<{
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}> {
  // Create FormData to send the image
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Call our API endpoint that interfaces with an AI service
  const response = await fetch('/api/extract-colors', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to extract colors');
  }
  
  return await response.json();
} 