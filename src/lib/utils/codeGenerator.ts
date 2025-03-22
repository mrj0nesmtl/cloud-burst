/**
 * Utility function to generate a random event access code
 * This creates a unique, human-readable code for event attendees
 */
export function generateEventAccessCode(length = 8): string {
  // Use characters that are easy to read and unlikely to be confused
  // Exclude similar-looking characters: 0/O, 1/I/l, etc.
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Create a Uint32Array of the required length for randomness
  const randomValues = new Uint32Array(length);
  
  // Fill the array with random values
  if (typeof window !== 'undefined' && window.crypto) {
    // Use the Web Crypto API if available (client-side)
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback to Math.random for server-side or unsupported browsers
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0x100000000);
    }
  }
  
  // Generate the code using the random values
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % characters.length);
  }
  
  // Format the code with a hyphen in the middle for readability
  // e.g., "ABCD-1234"
  if (length >= 6) {
    const midpoint = Math.floor(length / 2);
    result = result.substring(0, midpoint) + '-' + result.substring(midpoint);
  }
  
  return result;
}

/**
 * Validate an event access code
 */
export function validateEventAccessCode(code: string): boolean {
  // Remove any hyphens for validation
  const cleanCode = code.replace(/-/g, '');
  
  // Check that the code matches our expected format
  // Only allowed characters, and appropriate length
  const validFormat = /^[A-Z0-9]{6,12}$/i.test(cleanCode);
  
  return validFormat;
}

/**
 * Format an access code for display
 */
export function formatAccessCode(code: string): string {
  // Remove any existing hyphens
  const cleanCode = code.replace(/-/g, '');
  
  // If the code is long enough, add a hyphen in the middle
  if (cleanCode.length >= 6) {
    const midpoint = Math.floor(cleanCode.length / 2);
    return cleanCode.substring(0, midpoint) + '-' + cleanCode.substring(midpoint);
  }
  
  return cleanCode;
} 