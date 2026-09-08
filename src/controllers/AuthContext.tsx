import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { authReducer, initialAuthState, AuthState } from './auth.reducer';
import { loginConGoogle } from '../api/auth.api';
import { Usuario } from '../core/types/usuario.types';

const TOKEN_STORAGE_KEY = 'lumen_token';

/** El JWT ya viene firmado y validado por el backend — acá solo se lee el payload para poblar el usuario en memoria, sin verificar la firma (eso ya lo hizo el servidor). */
function decodeJwtPayload(token: string): Usuario | null {
  try {
    const payloadB64 = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const payload = JSON.parse(json);
    if (typeof payload.sub !== 'number' || !payload.nombre || !payload.rol) return null;
    return { idUsuario: payload.sub, nombre: payload.nombre, rol: payload.rol };
  } catch {
    return null;
  }
}

function hydrateInitialState(initial: AuthState): AuthState {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!storedToken) return initial;
  const usuario = decodeJwtPayload(storedToken);
  if (!usuario) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return initial;
  }
  return { usuario, token: storedToken };
}

interface AuthContextProps extends AuthState {
  login: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState, hydrateInitialState);

  const login = async (idToken: string) => {
    const { access_token } = await loginConGoogle(idToken);
    const usuario = decodeJwtPayload(access_token);
    if (!usuario) {
      throw new Error('El backend devolvió un token inválido.');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    dispatch({ type: 'LOGIN', payload: { usuario, token: access_token } });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
