import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return sessionStorage.getItem(key); } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { sessionStorage.setItem(key, val); } },
  remove: (key) => { try { localStorage.removeItem(key); } catch { sessionStorage.removeItem(key); } }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.get('ih_token');
    const stored = storage.get('ih_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
      authAPI.getMe().then(res => {
        setUser(res.data.user);
        storage.set('ih_user', JSON.stringify(res.data.user));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    storage.set('ih_token', res.data.token);
    storage.set('ih_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    storage.set('ih_token', res.data.token);
    storage.set('ih_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    storage.remove('ih_token');
    storage.remove('ih_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.set('ih_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);