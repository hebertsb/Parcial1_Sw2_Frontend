// El frontend corre en el puerto 3000 (único origen autorizado en el cliente OAuth de Google), así que el backend NestJS usa el 3333
// (docker-compose y Backend/.env.example). Sin un .env.local el respaldo tiene que ser ese: con el 3000 el frontend se llamaría a sí mismo.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

if (import.meta.env.DEV && typeof window !== 'undefined' && new URL(API_URL, window.location.href).origin === window.location.origin) {
  console.error(`[api] VITE_API_URL (${API_URL}) apunta al propio frontend: el backend corre en el puerto 3333. Revisá tu .env.local (ver .env.example).`);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

/**
 * Wrapper minimo sobre fetch. El filtro global del backend
 * (HttpExceptionFilter) siempre devuelve errores como { message, code } —
 * ver Backend/src/shared/exceptions/http-exception.filter.ts.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    if (res.status === 401 && options.token) {
      // Solo se cierra la sesion si la llamada llevaba un token y el backend
      // lo rechazo (vencio, o dejo de servir) — eso si significa que la sesion
      // activa murio (ver auditoria 2026-09-15). Un 401 SIN token (ej. un
      // intento de login-simplificado con nombre/rol que no existe) es solo
      // una credencial invalida, no la sesion actual: si no se filtra por
      // options.token, un intento fallido de loguearse como otro usuario
      // cierra la sesion de la cuenta con la que ya se estaba, que es el bug
      // que se reporto (2026-09-17).
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(
      errorBody?.message ?? `Error ${res.status} al llamar ${path}`,
      res.status,
      errorBody?.code,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
