import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'react-oidc-context'; 

const ProtectedRoutes = () => {
  const auth = useAuth();
  console.log(auth.isAuthenticated);
  console.log("___________________________________hereherehereinprotectedroutes");

  // if (!auth.isAuthenticated) {
  //   // Redirect to the login page or another appropriate route if not authenticated
  //   return <Navigate to="/" replace />; 
  // }

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />; 
  // COMMENT THE RETURN STATEMENT BELOW, AND UNCOMMENT THE RETURN STATEMENT ABOVE WHILE IN PRODUCTION OR BUILDING
  // return <Outlet />;
};

export default ProtectedRoutes;