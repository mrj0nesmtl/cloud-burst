import { createClient } from "@supabase/supabase-js";

// This script uses the service role to bypass RLS policies
// You should only run this during development

const createGallery = async () => {
  // Get Supabase credentials from env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
    return;
  }
  
  // Create a Supabase client with the service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Event ID from your database
  const eventId = "4458ad61-b208-4034-ae06-45d097bdf081";
  
  console.log(`Checking for existing gallery for event ${eventId}...`);
  
  // Check if gallery already exists
  const { data: existingGallery, error: checkError } = await supabase
    .from('galleries')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
  
  if (checkError) {
    console.error("Error checking for existing gallery:", checkError);
    return;
  }
  
  if (existingGallery) {
    console.log("Gallery already exists:", existingGallery);
    return;
  }
  
  // Default gallery settings
  const defaultSettings = {
    layout: 'grid',
    allowUploads: true,
    requireApproval: true,
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  };
  
  console.log("Creating new gallery...");
  
  // Create a new gallery
  const { data: newGallery, error: createError } = await supabase
    .from('galleries')
    .insert({
      event_id: eventId,
      settings: defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (createError) {
    console.error("Error creating gallery:", createError);
    return;
  }
  
  console.log("Gallery created successfully:", newGallery);
};

createGallery().catch(console.error); 