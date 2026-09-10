import { apiFetch } from './client';
import type { Rol } from '../core/types/usuario.types';

export interface LoginResponse {
  access_token: string;
}

/** Envia el ID token que ya emitio Google Identity Services al backend, que lo verifica server-side. */
export function loginConGoogle(idToken: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/google', { method: 'POST', body: { idToken } });
}

/** Login simplificado (sin contraseña, ver docs/db-schema-notes.md del backend) — usado por el panel de administrador. */
export function loginSimplificado(nombre: string, rol: Rol): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: { nombre, rol } });
}
