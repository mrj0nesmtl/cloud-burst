import { createClient } from "../../src/lib/supabase/client";

const checkData = async () => {
  const supabase = createClient();
  
  console.log("Checking authentication...");
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Authenticated user:", user?.email);
  
  console.log("\nChecking events...");
  const { data: events, error: eventsError } = await supabase.from("events").select("*").limit(5);
  if (eventsError) console.error("Error fetching events:", eventsError);
  else console.log("Events:", events);
  
  console.log("\nChecking galleries...");
  const { data: galleries, error: galleriesError } = await supabase.from("galleries").select("*").limit(5);
  if (galleriesError) console.error("Error fetching galleries:", galleriesError);
  else console.log("Galleries:", galleries);
  
  // Check specific gallery
  const eventId = "4458ad61-b208-4034-ae06-45d097bdf081";
  console.log(`\nChecking gallery for event ${eventId}...`);
  const { data: eventGallery, error: eventGalleryError } = await supabase
    .from("galleries")
    .select("*")
    .eq("event_id", eventId)
    .single();
  
  if (eventGalleryError) console.error("Error fetching event gallery:", eventGalleryError);
  else console.log("Event gallery:", eventGallery);
};

checkData().catch(console.error); 