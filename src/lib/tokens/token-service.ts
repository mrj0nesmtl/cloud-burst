import { createClient } from '@/lib/supabase/client';
import { randomBytes, createHash } from 'crypto';
import { AUTH_TOKEN_TYPES, TOKEN_EXPIRY, TOKEN_TABLE, TokenType } from './token-constants';

/**
 * Interface for token metadata
 */
export interface TokenMetadata {
  userId?: string;
  guestId?: string;
  eventId?: string;
  email: string;
  type: TokenType;
  [key: string]: any;
}

/**
 * Generates a secure random token
 * @returns A random token string
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hashes a token using SHA-256
 * @param token The token to hash
 * @returns The hashed token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Stores a token in the database
 * @param token The token to store
 * @param metadata Metadata associated with the token
 * @returns Success status of the operation
 */
export async function storeToken(token: string, metadata: TokenMetadata): Promise<boolean> {
  const supabase = createClient();
  const hashedToken = hashToken(token);
  
  // Calculate expiry date based on token type
  const tokenType = metadata.type;
  const expiryMs = TOKEN_EXPIRY[tokenType] || TOKEN_EXPIRY.MAGIC_LINK;
  const expiresAt = new Date(Date.now() + expiryMs);
  
  try {
    const { error } = await supabase
      .from(TOKEN_TABLE)
      .insert({
        token: hashedToken,
        metadata,
        expires_at: expiresAt.toISOString(),
        type: metadata.type,
      });
      
    if (error) {
      console.error('Error storing token:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception storing token:', error);
    return false;
  }
}

/**
 * Validates a token and returns its metadata if valid
 * @param token The token to validate
 * @param type The expected token type
 * @returns The token metadata if valid, null otherwise
 */
export async function validateToken(token: string, type: TokenType): Promise<TokenMetadata | null> {
  const supabase = createClient();
  const hashedToken = hashToken(token);
  
  try {
    const { data, error } = await supabase
      .from(TOKEN_TABLE)
      .select('*')
      .eq('token', hashedToken)
      .eq('type', type)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (error || !data) {
      console.error('Token validation error or token not found:', error);
      return null;
    }
    
    return data.metadata as TokenMetadata;
  } catch (error) {
    console.error('Exception validating token:', error);
    return null;
  }
}

/**
 * Invalidates a token after it has been used
 * @param token The token to invalidate
 * @returns Success status of the operation
 */
export async function invalidateToken(token: string): Promise<boolean> {
  const supabase = createClient();
  const hashedToken = hashToken(token);
  
  try {
    const { error } = await supabase
      .from(TOKEN_TABLE)
      .delete()
      .eq('token', hashedToken);
      
    if (error) {
      console.error('Error invalidating token:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception invalidating token:', error);
    return false;
  }
} 