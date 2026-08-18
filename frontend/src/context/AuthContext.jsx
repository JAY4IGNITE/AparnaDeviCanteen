import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aparnadevicanteen_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('aparnadevicanteen_user');
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
    localStorage.setItem('aparnadevicanteen_token', newToken);
    localStorage.setItem('aparnadevicanteen_user', JSON.stringify(userData));
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
    localStorage.removeItem('aparnadevicanteen_token');
    localStorage.removeItem('aparnadevicanteen_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('aparnadevicanteen_user', JSON.stringify(userData));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated, isAdmin }}>
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
