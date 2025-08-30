/**
 * Authentication Provider
 * @fileoverview React context for global authentication state management
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ClientUser } from '@shared/types';
import { apiService } from '../../services/api.service';

interface AuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Fetch current user and update state
   */
  const fetchUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userData = await apiService.fetchMe();
      setUser(userData);
    } catch (error) {
      // User not authenticated or error occurred
      setUser(null);
      console.debug('User not authenticated:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiate GitHub OAuth flow
   */
  const login = (): void => {
    window.location.href = apiService.getGitHubAuthUrl();
  };

  /**
   * Logout user and clear state
   */
  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if API call fails
      setUser(null);
    }
  };

  /**
   * Manually refetch user data
   */
  const refetchUser = async (): Promise<void> => {
    await fetchUser();
  };

  // Check authentication status on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}