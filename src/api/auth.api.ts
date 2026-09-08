import { apiFetch } from './client';

export interface LoginResponse {
  access_token: string;
}

/** Envia el ID token que ya emitio Google Identity Services al backend, que lo verifica server-side. */
export function loginConGoogle(idToken: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/google', { method: 'POST', body: { idToken } });
}
