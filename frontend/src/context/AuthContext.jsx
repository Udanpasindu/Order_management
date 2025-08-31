import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if token is valid on initial load
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      try {
        // Validate token and refresh user from backend
        const profile = await getProfile();
        const normalizedUser = {
          id: profile._id || profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('token', userData.token);
    setUser(userData.user);
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const isAdmin = () => {
    return user && user.role === 'admin';
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
