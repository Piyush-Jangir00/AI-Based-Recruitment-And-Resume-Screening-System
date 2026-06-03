import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { initialUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth uses **sessionStorage** (per-tab) so that the Admin tab and the
 * Candidate tab can each hold their own session independently.
 *
 * The user database itself is in **localStorage** (shared) so both tabs
 * can see every registered user.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restore per-tab session
    const stored = sessionStorage.getItem('tabUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* corrupt */ }
    }

    // Seed user database in localStorage if empty
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      sessionStorage.setItem('tabUser', JSON.stringify(found));
      // Also set a legacy key so the Landing page can detect auth
      localStorage.setItem('lastLogin', JSON.stringify({ role: found.role, ts: Date.now() }));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) return false;

    const newUser: User = {
      id: `${role === 'admin' ? 'admin' : 'user'}-${Date.now()}`,
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser(newUser);
    sessionStorage.setItem('tabUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('tabUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem('tabUser', JSON.stringify(updated));
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx] = updated; localStorage.setItem('users', JSON.stringify(users)); }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
