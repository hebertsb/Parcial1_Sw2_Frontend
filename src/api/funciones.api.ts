import { apiFetch } from './client';
import type { Funcion, AsientoDisponibilidad, CrearFuncionInput } from '../core/types/funcion.types';

/** `GET /funciones` — ruta pública (`@Public()`), no requiere sesión. Ver Backend/src/modules/funciones/funciones.controller.ts. */
export function listarFunciones(token?: string | null): Promise<Funcion[]> {
  return apiFetch<Funcion[]>('/funciones', { token });
}

/** `GET /funciones/:id/disponibilidad` — también pública, lista plana de asientos + su estado para esa función. */
export function obtenerDisponibilidad(idFuncion: number, token?: string | null): Promise<AsientoDisponibilidad[]> {
  return apiFetch<AsientoDisponibilidad[]>(`/funciones/${idFuncion}/disponibilidad`, { token });
}

/** `POST /funciones` — solo administrador. Puede rechazar con 409 (`CONFLICTO_HORARIO_SALA`) si se solapa con otra función de la misma sala. */
export function crearFuncion(input: CrearFuncionInput, token: string): Promise<Funcion> {
  return apiFetch<Funcion>('/funciones', { method: 'POST', body: input, token });
}

/** `PATCH /funciones/:id` — solo administrador. */
export function actualizarFuncion(idFuncion: number, input: Partial<CrearFuncionInput>, token: string): Promise<Funcion> {
  return apiFetch<Funcion>(`/funciones/${idFuncion}`, { method: 'PATCH', body: input, token });
}

/** `PATCH /funciones/:id/cancelar` — solo administrador. No hay borrado físico, ver FuncionesService.cancelar. */
export function cancelarFuncion(idFuncion: number, token: string): Promise<Funcion> {
  return apiFetch<Funcion>(`/funciones/${idFuncion}/cancelar`, { method: 'PATCH', token });
}
