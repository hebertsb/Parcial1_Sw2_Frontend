import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
 useAuth } from '../controllers/AuthContext';

/**
 * Guard de seguridad para el Panel Administrativo (RF11).
 * Redirige a /admin si no hay usuario logueado o si su rol no es 'administrador'.
 */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario || usuario.rol !== 'administrador') {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
