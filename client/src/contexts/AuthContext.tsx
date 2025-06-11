import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // To handle loading state during login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Attempt to load initial auth state from localStorage (simple persistence)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const storedAuth = localStorage.getItem('isAuthenticated');
      return storedAuth ? JSON.parse(storedAuth) : false;
    } catch (error) {
      console.error('Error reading auth state from localStorage:', error);
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false); // Renamed from authIsLoading to isLoading for context value

  useEffect(() => {
    // Persist auth state to localStorage
    try {
      localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error('Error writing auth state to localStorage:', error);
    }
  }, [isAuthenticated]);

  const login = async (password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed with status: ' + response.status }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Assuming successful login if response is ok
      // const data = await response.json(); // if backend sends { authenticated: true }
      // if (data.authenticated) { setIsAuthenticated(true); }
      setIsAuthenticated(true); // Simplified: if API returns 2xx, consider logged in

    } catch (error) {
      setIsAuthenticated(false); // Ensure auth is false on error
      if (error instanceof Error) {
        throw new Error(error.message || 'An unknown error occurred during login.');
      }
      throw new Error('An unknown error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Optionally, could call a /api/logout endpoint if sessions were involved
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
