import { nanoid } from 'nanoid';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TokenType } from './token-constants';

/**
 * Generate a cryptographically secure token
 * @param length Length of the token
 * @returns Secure random token string
 */
export function generateToken(length: number = 24): string {
  return nanoid(length);
}

/**
 * Store a token in the database
 * @param token The token to store
 * @param tokenType The type of token
 * @param userId Associated user ID (if applicable)
 * @param email Associated email address
 * @param metadata Any additional metadata for the token
 * @param expiresAt When the token expires
 * @returns Success or failure
 */
export async function storeToken({
  token,
  tokenType,
  userId = null,
  email,
  metadata = {},
  expiresAt,
}: {
  token: string;
  tokenType: TokenType;
  userId?: string | null;
  email: string;
  metadata?: Record<string, any>;
  expiresAt: Date;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase
    .from('auth_tokens')
    .insert({
      token,
      type: tokenType,
      user_id: userId,
      email,
      metadata,
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error storing token:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

/**
 * Validate a token from the database
 * @param token The token to validate
 * @param tokenType The type of token to validate
 * @returns Token data if valid, null if invalid
 */
export async function validateToken(token: string, tokenType: TokenType) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get the token from the database
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('token', token)
    .eq('type', tokenType)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    console.error('Error validating token:', error);
    return { valid: false, error };
  }
  
  return { valid: true, data };
}

/**
 * Mark a token as used
 * @param token The token to mark as used
 * @param tokenType The type of token
 */
export async function markTokenAsUsed(token: string, tokenType: TokenType) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase
    .from('auth_tokens')
    .update({ used: true })
    .eq('token', token)
    .eq('type', tokenType);
  
  if (error) {
    console.error('Error marking token as used:', error);
    return { success: false, error };
  }
  
  return { success: true };
} 