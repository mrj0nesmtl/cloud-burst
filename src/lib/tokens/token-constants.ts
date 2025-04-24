/**
 * Enum defining the different types of tokens used in the application
 */
export enum AUTH_TOKEN_TYPES {
  MAGIC_LINK = 'magic_link',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  INVITATION = 'invitation',
}

/**
 * Type definition for the token type
 */
export type TokenType = AUTH_TOKEN_TYPES;

/**
 * Token expiry durations in milliseconds
 */
export const TOKEN_EXPIRY = {
  MAGIC_LINK: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFICATION: 48 * 60 * 60 * 1000, // 48 hours
  INVITATION: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Database table name for storing tokens
 */
export const TOKEN_TABLE = 'auth_tokens'; 