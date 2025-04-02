import QRCode from 'qrcode';

/**
 * Options for QR code generation
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a QR code for an invitation
 * @param token The invitation token
 * @param options Optional configuration for the QR code
 * @returns A Promise that resolves to a data URL of the generated QR code
 */
export async function generateInvitationQRCode(
  token: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // If the environment variable is not defined in development, use a fallback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cloudburst.mrjones.dev';
  
  // Construct full invitation URL
  const invitationUrl = `${baseUrl}/invitation/${token}`;
  
  // Set default options
  const qrOptions = {
    errorCorrectionLevel: 'M',
    width: options.size || 300,
    margin: options.margin ?? 4,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#ffffff'
    }
  };
  
  try {
    // Generate QR code as data URL
    return await QRCode.toDataURL(invitationUrl, qrOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validates an invitation token format
 * @param token The token to validate
 * @returns True if the token is valid, false otherwise
 */
export function isValidInvitationToken(token: string): boolean {
  // Token format: 8 characters, alphanumeric with hyphens
  // Example: "a1b2-c3d4"
  return /^[a-zA-Z0-9-]{8,}$/.test(token);
}

/**
 * Extracts an invitation token from a URL
 * @param url The URL containing the token
 * @returns The extracted token or null if not found
 */
export function extractInvitationTokenFromUrl(url: string): string | null {
  try {
    // Create URL object to handle parsing
    const parsedUrl = new URL(url);
    
    // Check if this is an invitation URL
    if (parsedUrl.pathname.includes('/invitation/')) {
      // Extract token from path
      const pathParts = parsedUrl.pathname.split('/');
      const tokenIndex = pathParts.findIndex(part => part === 'invitation') + 1;
      
      if (tokenIndex < pathParts.length) {
        const token = pathParts[tokenIndex];
        return isValidInvitationToken(token) ? token : null;
      }
    }
    
    return null;
  } catch (error) {
    // Invalid URL
    return null;
  }
} 