import { apiFetch } from './client';
import type { Promocion, CrearPromocionInput, ActualizarPromocionInput } from '../core/types/promocion.types';

/** `GET /promociones` — requiere JWT (cualquier rol), ver Backend/src/modules/promociones/promociones.controller.ts. */
export function listarPromociones(token?: string | null): Promise<Promocion[]> {
  return apiFetch<Promocion[]>('/promociones', { token });
}

/** `POST /promociones` — solo administrador. Nace con `activa=true`. */
export function crearPromocion(input: CrearPromocionInput, token: string): Promise<Promocion> {
  return apiFetch<Promocion>('/promociones', { method: 'POST', body: input, token });
}

/** `PATCH /promociones/:id` — solo administrador. Único endpoint que admite `activa` (toggle sin borrar). */
export function actualizarPromocion(idPromocion: number, input: ActualizarPromocionInput, token: string): Promise<Promocion> {
  return apiFetch<Promocion>(`/promociones/${idPromocion}`, { method: 'PATCH', body: input, token });
}

/** `DELETE /promociones/:id` — solo administrador. Rechaza con 409 si alguna venta ya usó esta promoción. */
export function eliminarPromocion(idPromocion: number, token: string): Promise<void> {
  return apiFetch<void>(`/promociones/${idPromocion}`, { method: 'DELETE', token });
}

/** `POST /promociones/:id/funciones/:idFuncion` — solo administrador. Asocia la promoción a una función existente (`promocion_funcion`). */
export function asociarPromocionAFuncion(idPromocion: number, idFuncion: number, token: string): Promise<{ idPromocion: number; idFuncion: number }> {
  return apiFetch<{ idPromocion: number; idFuncion: number }>(`/promociones/${idPromocion}/funciones/${idFuncion}`, { method: 'POST', token });
}
