import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const resolveApiUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return 'https://aparnadevicanteen.onrender.com/api';
};

const API_URL = resolveApiUrl();

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('foodnest_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('foodnest_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const res = await axios.post('/auth/login', credentials);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('foodnest_token', newToken);
    localStorage.setItem('foodnest_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return userData;
  };

  const register = async (data) => {
    const res = await axios.post('/auth/register', data);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foodnest_token');
    localStorage.removeItem('foodnest_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('foodnest_user', JSON.stringify(userData));
  };

  const updateEmail = async (email) => {
    const res = await axios.put('/auth/update-email', { email });
    const updatedUser = res.data.user;
    updateUser(updatedUser);
    return updatedUser;
  };

  const resendVerification = async (email) => {
    const res = await axios.post('/auth/resend-verification', { email });
    if (res.data?.user) {
      updateUser(res.data.user);
    }
    return res.data;
  };

  const verifyEmail = async (token) => {
    const res = await axios.post('/auth/verify-email', { token });
    if (res.data?.user) {
      updateUser(res.data.user);
    } else if (user) {
      updateUser({ ...user, email_verified: true });
    }
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await axios.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    const res = await axios.post('/auth/reset-password', { token, newPassword, confirmPassword });
    return res.data;
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, register, logout, updateUser, updateEmail, 
      resendVerification, verifyEmail, forgotPassword, resetPassword,
      isAuthenticated, isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
