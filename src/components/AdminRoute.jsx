import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getStoredToken } from '../services/api.js';

const AdminRoute = ({ children }) => {
  const { authLoading, isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToken = Boolean(getStoredToken());

  if (authLoading && hasToken) {
    return null;
  }

  if (!hasToken || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default AdminRoute;
