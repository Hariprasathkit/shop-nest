import React, { createContext, useContext, useEffect, useState } from 'react';
import api, {
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '../services/api.js';
import { updateProfile as updateProfileRequest } from '../services/userApi.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuthState = () => {
    setStoredToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(clearAuthState);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getStoredToken();

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
      } catch {
        clearAuthState();
      } finally {
        setAuthLoading(false);
      }
    };

    loadProfile();
  }, []);

  const signup = async (userData) => {
    try {
      await api.post('/auth/register', userData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to create account.');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setStoredToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      clearAuthState();

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      throw new Error(error.response?.data?.message || 'Unable to login.');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await updateProfileRequest(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to update profile.');
    }
  };

  const logout = () => {
    clearAuthState();
  };

  const value = {
    user,
    authLoading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.isAdmin),
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
