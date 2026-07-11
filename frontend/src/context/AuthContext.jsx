import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ih_token');
    const stored = localStorage.getItem('ih_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('ih_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('ih_token');
          localStorage.removeItem('ih_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('ih_token', res.data.token);
    localStorage.setItem('ih_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const token = res.data.token;
    const userObj = res.data.user;
    if (token) {
      localStorage.setItem('ih_token', token);
      localStorage.setItem('ih_user', JSON.stringify(userObj));
      setUser(userObj);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('ih_token');
    localStorage.removeItem('ih_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ih_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);