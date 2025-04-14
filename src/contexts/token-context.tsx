import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { invitationTokenService, TokenData, TokenError } from '@/lib/tokens/invitation-token';

/**
 * Context for token management across the application
 */
interface TokenContextType {
  token: string | null;
  tokenData: TokenData | null;
  isLoading: boolean;
  error: TokenError | null;
  refreshToken: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

/**
 * Provider component for token management
 */
export function TokenProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TokenError | null>(null);
  
  /**
   * Load and validate token from all available sources
   */
  const loadToken = async () => {
    setIsLoading(true);
    setError(null);
    
    // Use the comprehensive error handling method
    const result = await invitationTokenService.getTokenWithErrorHandling(searchParams);
    
    if (result.success && result.token && result.data) {
      setToken(result.token);
      setTokenData(result.data);
      setError(null);
    } else {
      setToken(null);
      setTokenData(null);
      setError(result.error || {
        type: 'validation_error',
        message: 'Unknown error during token validation',
        userMessage: 'We encountered a problem with your invitation. Please try again or contact the event organizer.'
      });
    }
    
    setIsLoading(false);
  };
  
  // Load token on component mount and when searchParams change
  useEffect(() => {
    loadToken();
  }, [searchParams]);
  
  return (
    <TokenContext.Provider 
      value={{ 
        token, 
        tokenData, 
        isLoading, 
        error, 
        refreshToken: loadToken 
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

/**
 * Hook to access the token context
 * @returns The token context
 */
export const useToken = () => {
  const context = useContext(TokenContext);
  
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  
  return context;
}; 