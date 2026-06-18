import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount – re-hydrate user from token
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('token');
      if (!stored) { setLoading(false); return; }
      try {
        const res = await getMe();
        setUser(res.data.data || res.data.user);
        setToken(stored);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    const { token: jwt, user: userData } = res.data.data || res.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    toast.success(`Welcome back, ${userData.fullName || userData.email}!`);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    const { token: jwt, user: userData } = res.data.data || res.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    toast.success('Account created successfully! 🎉');
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* silent */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
