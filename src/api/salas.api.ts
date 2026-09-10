import { apiFetch } from './client';
import type { Sala, CrearSalaInput, ActualizarSalaInput } from '../core/types/sala.types';

/** `GET /salas` — requiere JWT (cualquier rol), ver Backend/src/modules/salas/salas.controller.ts. */
export function listarSalas(token?: string | null): Promise<Sala[]> {
  return apiFetch<Sala[]>('/salas', { token });
}

/** `GET /salas/:id` — requiere JWT (cualquier rol). Usado para mostrar la sala real de la función elegida (ver ProcesoCompra.tsx). */
export function obtenerSala(idSala: number, token?: string | null): Promise<Sala> {
  return apiFetch<Sala>(`/salas/${idSala}`, { token });
}

/** `POST /salas` — solo administrador. Genera los asientos automáticamente según `capacidad`/`asientosPorFila`. */
export function crearSala(input: CrearSalaInput, token: string): Promise<Sala> {
  return apiFetch<Sala>('/salas', { method: 'POST', body: input, token });
}

/** `PATCH /salas/:id` — solo administrador. No admite `capacidad`/`asientosPorFila` (ver ActualizarSalaInput). */
export function actualizarSala(idSala: number, input: ActualizarSalaInput, token: string): Promise<Sala> {
  return apiFetch<Sala>(`/salas/${idSala}`, { method: 'PATCH', body: input, token });
}

/** `DELETE /salas/:id` — solo administrador. Borrado físico real; rechaza con 409 si tiene funciones asociadas (cualquier estado/fecha). */
export function eliminarSala(idSala: number, token: string): Promise<void> {
  return apiFetch<void>(`/salas/${idSala}`, { method: 'DELETE', token });
}
