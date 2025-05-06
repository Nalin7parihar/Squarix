"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';

export interface User {
  _id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updatePassword: (passwordData: { oldPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Credentials 'include' is necessary to send cookies
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
        // Don't redirect here, let protected routes handle it
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      console.log('ENV backend URL:', process.env.NEXT_PUBLIC_API_URL);
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user); // Set user directly from login response
        toast.success(data.message || 'Login successful');
        
        // Use router.push with a slight delay to ensure state is updated
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        toast.error(data.message || 'Login failed');
        setUser(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Registration successful');
        // Automatically log in after registration
        await login({ email: userData.email, password: userData.password });
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Logout successful');
      } else {
        // Still clear user state even if backend logout fails
        toast.error(data.message || 'Logout failed on server, logging out locally.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout.');
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push('/auth'); // Redirect to login page
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/deleteAccount`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Account deleted successfully');
        setUser(null); // Clear user state
        router.push('/auth'); // Redirect to login/auth page
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('An error occurred while deleting the account.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (passwordData: { oldPassword: string; newPassword: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/updatePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Password updated successfully');
        await logout(); // Logout the user after password change
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('An error occurred while updating the password');
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated, 
      login, 
      register, 
      logout, 
      deleteAccount,
      updatePassword 
    }}>
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