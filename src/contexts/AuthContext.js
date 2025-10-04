import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Set up axios interceptor for auth token and handle expired tokens
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && 
            (error.response?.data?.code === 'TOKEN_EXPIRED' || 
             error.response?.data?.code === 'INVALID_TOKEN')) {
          console.log('🔒 Token expired, auto logout');
          logout();
          // Optionally show a notification
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔄 useEffect loadUser - token:', storedToken?.substring(0, 20) + '...', 'stored user:', storedUser);
      
      if (storedToken) {
        try {
          // First try to load user from localStorage
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('✅ User loaded from localStorage:', userData.email);
          } else {
            // If no stored user, try to fetch from backend
            const response = await axios.get('/api/auth/me');
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('✅ User loaded from backend:', response.data.user.email);
          }
        } catch (error) {
          console.error('⚠️ Failed to load user (not logging out):', error.message);
          // Don't logout - just clear user but keep token
          // User might be valid but network failed
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Đăng nhập thất bại' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Đăng ký thất bại' 
      };
    }
  };

  const loginWithGoogle = async (tokenId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/auth/google`, { tokenId });
      const { accessToken, user: userData } = response.data;
      
      console.log('✅ Google login response:', { accessToken: accessToken?.substring(0, 20) + '...', user: userData?.email });
      
      // Update BOTH localStorage AND state
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Then update state - both at once
      setToken(accessToken);
      setUser(userData);
      
      // Update axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('✅ Auth state updated - localStorage and state set');
      console.log('Token in localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('User in localStorage:', localStorage.getItem('user'));
      
      return { success: true, message: 'Đăng nhập thành công!' };
    } catch (error) {
      console.error('❌ Login with Google error:', error);
      const message = error.response?.data?.message || 'Đăng nhập Google thất bại';
      return { success: false, error: message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
    canUseTrial: user?.canUseTrial || false,
    isSubscriptionActive: user?.isSubscriptionActive || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};