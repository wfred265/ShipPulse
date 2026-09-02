import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_STORAGE_KEY = 'shippulse_auth_admin';

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [adminStaffList, setAdminStaffList] = useState([
    { id: 1, username: 'admin', fullName: 'Executive Super Admin', role: 'Super Admin', email: 'admin@shippulse.com', createdAt: 'System Default' }
  ]);

  // Fetch admin staff list on load
  useEffect(() => {
    async function fetchStaff() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('admin_users').select('id, username, fullName, role, created_at');
          if (!error && Array.isArray(data) && data.length > 0) {
            setAdminStaffList(data);
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
              setAdminStaffList(result.data);
            }
          }
        }
      } catch (err) {
        console.warn("Backend auth API offline, running in local auth mode");
      }
    }
    fetchStaff();
  }, []);

  const login = async (username, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .maybeSingle();

        if (!error && data) {
          const { password, ...userWithoutPassword } = data;
          setCurrentAdmin(userWithoutPassword);
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
          return { success: true };
        }
      } catch (e) {}
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await res.json();
          if (result.success && result.user) {
            setCurrentAdmin(result.user);
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
            return { success: true };
          }
        }
      }
    } catch (err) {}

    // Local fallback
    if (username === 'admin' && password === 'shippulse2026') {
      const adminObj = {
        id: 1,
        username: 'admin',
        fullName: 'Executive Super Admin',
        role: 'Super Admin'
      };
      setCurrentAdmin(adminObj);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminObj));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentAdmin(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const createAdminStaff = async (newStaffObj) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffObj)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setAdminStaffList(prev => [...prev, result.data]);
          return { success: true };
        }
      }
    } catch (err) {}

    // Fallback
    const localNew = {
      id: Date.now(),
      username: newStaffObj.username,
      fullName: newStaffObj.fullName,
      email: newStaffObj.email || `${newStaffObj.username}@shippulse.com`,
      role: newStaffObj.role || 'Operations Manager'
    };
    setAdminStaffList(prev => [...prev, localNew]);
    return { success: true };
  };

  const deleteAdminStaff = async (usernameOrId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${usernameOrId}`, { method: 'DELETE' });
    } catch (err) {}
    setAdminStaffList(prev => prev.filter(u => u.id !== usernameOrId && u.username !== usernameOrId));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!currentAdmin,
      currentAdmin,
      adminStaffList,
      adminUsers: adminStaffList,
      login,
      logout,
      createAdminStaff,
      addAdminUser: createAdminStaff,
      deleteAdminStaff,
      deleteAdminUser: deleteAdminStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
