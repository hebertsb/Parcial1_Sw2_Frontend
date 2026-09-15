import { apiFetch } from './client';
import type { Precio, CrearPrecioInput } from '../core/types/precio.types';

/** `GET /precios` — requiere JWT (cualquier rol), ver Backend/src/modules/precios/precios.controller.ts. */
export function listarPrecios(token?: string | null): Promise<Precio[]> {
  return apiFetch<Precio[]>('/precios', { token });
}

/** `GET /precios/:id` — requiere JWT (cualquier rol). Usado para mostrar el precio real de una función antes de confirmar la compra (ver ProcesoCompra.tsx). */
export function obtenerPrecio(idPrecio: number, token?: string | null): Promise<Precio> {
  return apiFetch<Precio>(`/precios/${idPrecio}`, { token });
}

/** `POST /precios` — solo administrador. */
export function crearPrecio(input: CrearPrecioInput, token: string): Promise<Precio> {
  return apiFetch<Precio>('/precios', { method: 'POST', body: input, token });
}

/** `PATCH /precios/:id` — solo administrador. */
export function actualizarPrecio(idPrecio: number, input: Partial<CrearPrecioInput>, token: string): Promise<Precio> {
  return apiFetch<Precio>(`/precios/${idPrecio}`, { method: 'PATCH', body: input, token });
}

/** `DELETE /precios/:id` — solo administrador. Rechaza con 409 si alguna función referencia este precio. */
export function eliminarPrecio(idPrecio: number, token: string): Promise<void> {
  return apiFetch<void>(`/precios/${idPrecio}`, { method: 'DELETE', token });
}
