import { createServerClient } from '@/lib/supabase/client'

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  // ... rest of code ...
}
