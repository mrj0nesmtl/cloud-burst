/**
 * Extracts the storage path from a Supabase URL
 * @param url The original Supabase URL
 * @returns The storage path or null if it couldn't be extracted
 */
export function getStoragePathFromUrl(url: string): { path: string; bucket: string } | null {
  try {
    // Handle empty or undefined URLs
    if (!url) return null;
    
    // Standard Supabase storage URL pattern
    // Example: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const storageUrlPattern = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/;
    const match = url.match(storageUrlPattern);
    
    if (match) {
      return {
        bucket: match[1],
        path: match[2]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
}

/**
 * Converts a Supabase Storage URL to a proxied URL
 * @param url The original Supabase URL
 * @returns A proxied URL to be used in img tags
 */
export function getProxiedMediaUrl(url: string): string {
  // Return the URL as is if it's already a proxied URL
  if (url.startsWith('/api/media-proxy')) {
    return url;
  }
  
  // Try to extract path from Supabase URL
  const storageInfo = getStoragePathFromUrl(url);
  
  if (storageInfo) {
    return `/api/media-proxy?bucket=${encodeURIComponent(storageInfo.bucket)}&path=${encodeURIComponent(storageInfo.path)}`;
  }
  
  // Return the original URL if we couldn't extract the path
  // This allows fallbacks to work (like placeholder images)
  return url;
} 