import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkUserExists: (mobileNumber: string) => Promise<{ success: boolean; userExists: boolean; message: string }>;
  login: (mobileNumber: string, pin: string) => Promise<{ success: boolean; message: string; isSuspended?: boolean }>;
  register: (mobileNumber: string, name: string, pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (name: string, mobileNumber: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = `http://${window.location.hostname}:8080/api/auth`;

/** Retrieve JWT token stored after login */
function getStoredToken(): string | null {
  const saved = localStorage.getItem('user');
  if (!saved) return null;
  try {
    return JSON.parse(saved).token || null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  /** Returns headers with Authorization: Bearer <token> if logged in */
  const getAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const checkUserExists = async (mobileNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check`, { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, userExists: false, message: 'Network error. Please try again.' };
    }
  };

  const login = async (mobileNumber: string, pin: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, pin }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        // Store user + token together so getStoredToken() works
        const userWithToken = { ...data.user, token: data.token };
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        return { success: true, message: data.message };
      }
      if (data.user?.isSuspended || data.user?.suspended) {
        return { success: false, message: data.message || 'Account suspended', isSuspended: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (mobileNumber: string, name: string, pin: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, name, pin }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    if (user) {
      fetch(`${API_BASE_URL}/logout`, { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: user.mobileNumber }),
      });
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const changePin = async (currentPin: string, newPin: string) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const response = await fetch(`${API_BASE_URL}/change-pin`, { cache: 'no-store',
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mobileNumber: user.mobileNumber, currentPin, newPin }),
      });
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const updateProfile = async (name: string, mobileNumber: string) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, { cache: 'no-store',
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, mobileNumber }),
      });

      if (response.ok) {
        const updatedUserDto = await response.json();
        const token = getStoredToken();
        const updatedUser: User = {
          id: updatedUserDto.id,
          name: updatedUserDto.name,
          mobileNumber: updatedUserDto.mobileNumber,
          isLoggedIn: updatedUserDto.loggedIn,
          isSuspended: updatedUserDto.suspended,
          ritzTokenBalance: updatedUserDto.ritzTokenBalance
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify({ ...updatedUser, token }));
        return { success: true, message: 'Profile updated successfully' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update profile' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.mobileNumber}`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const token = getStoredToken();
        const updatedUser: User = {
          id: data.id,
          name: data.name,
          mobileNumber: data.mobileNumber,
          isLoggedIn: data.isLoggedIn || data.loggedIn || true,
          isSuspended: data.isSuspended || data.suspended,
          ritzTokenBalance: data.ritzTokenBalance
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify({ ...updatedUser, token }));
      } else if (response.status === 401 || response.status === 403) {
        // Token expired — force re-login
        logout();
      } else if (response.status === 404) {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Background status and balance sync
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => refreshUser(), 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, checkUserExists, login, register, logout, changePin, updateProfile, refreshUser, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
