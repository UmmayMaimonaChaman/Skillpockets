import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  // If not logged in, redirect to login and save current location for redirect after login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If roles are specified and current user role not included, redirect to Forbidden page
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Otherwise, render the protected page/component
  return children;
};

export default PrivateRoute;

