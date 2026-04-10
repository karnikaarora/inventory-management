import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PURPOSE: Wrap routes that should only be accessible to authenticated users with specific roles

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();   // Get user from global AuthContext

  //user logged in?
  if (!user) {
    // Redirect to login page
    // replace: true → doesn't add to browser history, so user can't go back to protected route
    return <Navigate to="/login" replace />;
  }


  // requiredRole comes from the route (e.g., "admin" or "employee")
  // user.role comes from the database (set during login, stored in localStorage)
  if (requiredRole && user.role !== requiredRole) {
    // Role doesn't match, redirect to home page
    // This prevents employees from accessing admin pages and vice versa
    return <Navigate to="/" replace />;
  }
  
  // ✅ User IS logged in
  // ✅ User HAS the correct role
  // So render the protected component 
  return children;
};

export default ProtectedRoute;