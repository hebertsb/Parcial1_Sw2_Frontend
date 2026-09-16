const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

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
    if (res.status === 401) {
      // El token guardado ya no sirve (vencio, o el backend lo rechazo por otra
      // razon) — avisar a AuthContext para que cierre la sesion en vez de dejar
      // a la app creyendo que sigue logueada mientras cada llamada real falla
      // en silencio (ver auditoria 2026-09-15).
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
