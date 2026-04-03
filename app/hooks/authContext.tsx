import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for the context
interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Define the default value for the context
const defaultAuthContext: AuthContextType = {
  token: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
};

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to load token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider value= {{ token, loading, login, logout }
}>
  { children }
  </AuthContext.Provider>
  );
};

