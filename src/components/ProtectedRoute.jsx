import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getStoredToken } from '../services/api.js';

const ProtectedRoute = ({ children }) => {
  const { authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToken = Boolean(getStoredToken());

  if (authLoading && hasToken) {
    return null;
  }

  if (!hasToken || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
