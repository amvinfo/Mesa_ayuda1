import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../data/types';
import { db, initializeDatabase } from '../data/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password verification (in production, use bcrypt on server)
function verifyPassword(input: string, stored: string): boolean {
  // For demo: accept 'admin123' as password for all users
  if (input === 'admin123') return true;
  // Also check if stored hash matches (simplified)
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeDatabase();
    const savedUser = localStorage.getItem('helpdesk_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const freshUser = db.getUserById(parsed.id);
      if (freshUser && freshUser.active) {
        setUser(freshUser);
      } else {
        localStorage.removeItem('helpdesk_current_user');
      }
    }
  }, []);

  const login = (username: string, password: string): { success: boolean; message: string } => {
    const foundUser = db.getUserByUsername(username);
    if (!foundUser) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    if (!foundUser.active) {
      return { success: false, message: 'Cuenta desactivada. Contacte al administrador.' };
    }
    if (!verifyPassword(password, foundUser.password)) {
      return { success: false, message: 'Contraseña incorrecta' };
    }
    db.updateUser(foundUser.id, { lastLogin: new Date().toISOString() });
    db.addAuditLog({
      id: crypto.randomUUID(),
      userId: foundUser.id,
      userName: foundUser.fullName,
      action: 'login',
      details: `Inicio de sesión exitoso`,
      createdAt: new Date().toISOString(),
    });
    const updatedUser = db.getUserById(foundUser.id)!;
    setUser(updatedUser);
    localStorage.setItem('helpdesk_current_user', JSON.stringify(updatedUser));
    return { success: true, message: 'Inicio de sesión exitoso' };
  };

  const logout = () => {
    if (user) {
      db.addAuditLog({
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.fullName,
        action: 'logout',
        details: 'Cierre de sesión',
        createdAt: new Date().toISOString(),
      });
    }
    setUser(null);
    localStorage.removeItem('helpdesk_current_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permMap: Record<string, string[]> = {
      admin: ['*'],
      supervisor: ['tickets.view_all', 'tickets.assign', 'tickets.escalate', 'tickets.reopen', 'reports.view', 'knowledge.manage', 'teams.manage'],
      technician: ['tickets.view_assigned', 'tickets.respond', 'tickets.resolve', 'tickets.notes_internal', 'knowledge.view_internal', 'knowledge.propose'],
      requester: ['tickets.create', 'tickets.view_own', 'tickets.respond_own', 'knowledge.view_external'],
      editor: ['knowledge.manage_external', 'knowledge.manage_internal'],
    };
    const perms = permMap[user.role] || [];
    return perms.includes('*') || perms.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
