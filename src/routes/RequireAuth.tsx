import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../controllers/AuthContext';

/** Redirige a /login (recordando de donde veniamos) si no hay usuario logueado. */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
