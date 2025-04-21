import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('isAuthenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        // Store auth in session storage
        sessionStorage.setItem('isAuthenticated', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };
  
  return { isAuthenticated, isLoading, login, logout };
}