import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

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

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated, isAdmin }}>
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
