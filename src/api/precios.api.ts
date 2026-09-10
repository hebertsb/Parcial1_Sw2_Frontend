import { apiFetch } from './client';
import type { Precio } from '../core/types/precio.types';

/** `GET /precios` — requiere JWT (cualquier rol), ver Backend/src/modules/precios/precios.controller.ts. */
export function listarPrecios(token?: string | null): Promise<Precio[]> {
  return apiFetch<Precio[]>('/precios', { token });
}

/** `GET /precios/:id` — requiere JWT (cualquier rol). Usado para mostrar el precio real de una función antes de confirmar la compra (ver ProcesoCompra.tsx). */
export function obtenerPrecio(idPrecio: number, token?: string | null): Promise<Precio> {
  return apiFetch<Precio>(`/precios/${idPrecio}`, { token });
}
