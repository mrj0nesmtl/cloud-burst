import QRCode from 'qrcode';
import { z } from 'zod';

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
 * Token validation schema using zod
 */
export const invitationTokenSchema = z
  .string()
  .regex(/^[a-zA-Z0-9\-]{8,36}$/, {
    message: 'Invitation token must be 8-36 characters (alphanumeric and hyphens)',
  });

/**
 * Generates a QR code for an invitation token
 * @param token Invitation token
 * @param options QR code generation options
 * @returns Promise resolving to a data URL of the QR code
 */
export async function generateInvitationQRCode(
  token: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cloudburst.photo';
  const invitationUrl = `${baseUrl}/invitation/${token}`;

  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'M' as QRCode.QRCodeErrorCorrectionLevel,
    margin: options.margin || 4,
    width: options.size || 300,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#ffffff',
    },
  };

  try {
    const dataUrl = await QRCode.toDataURL(invitationUrl, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validates an invitation token
 * @param token Token to validate
 * @returns Boolean indicating if token is valid
 */
export function isValidInvitationToken(token: string): boolean {
  try {
    invitationTokenSchema.parse(token);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts an invitation token from a URL
 * @param url URL that may contain an invitation token
 * @returns The extracted token or null if not found
 */
export function extractInvitationTokenFromUrl(url: string): string | null {
  try {
    // Check if it's already just a token
    if (isValidInvitationToken(url)) {
      return url;
    }

    // Check for URL patterns
    const urlObj = new URL(url);
    
    // Check path pattern: /invitation/TOKEN
    const pathMatch = urlObj.pathname.match(/\/invitation\/([a-zA-Z0-9\-]{8,36})$/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    // Check query pattern: ?token=TOKEN
    const tokenParam = urlObj.searchParams.get('token');
    if (tokenParam && isValidInvitationToken(tokenParam)) {
      return tokenParam;
    }
    
    return null;
  } catch (error) {
    // If URL parsing fails, return null
    return null;
  }
}

/**
 * Creates a shareable invitation URL
 * @param token Invitation token
 * @returns Full invitation URL
 */
export function createInvitationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cloudburst.photo';
  return `${baseUrl}/invitation/${token}`;
}

/**
 * Normalizes a token by removing any URL parts
 * @param input Token or URL containing a token
 * @returns Normalized token or null if invalid
 */
export function normalizeToken(input: string): string | null {
  // First try to extract from URL
  const extractedToken = extractInvitationTokenFromUrl(input);
  if (extractedToken) {
    return extractedToken;
  }
  
  // If not a URL, check if it's a valid token directly
  if (isValidInvitationToken(input)) {
    return input;
  }
  
  return null;
} 