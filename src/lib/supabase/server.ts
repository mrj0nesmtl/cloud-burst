// Re-export the server client functionality from client.ts
import { createServerClient } from './client'

// Export the function with the name that's being imported elsewhere
export const getServerSupabase = createServerClient

// Also export the original function for compatibility
export { createServerClient } 