import { apiFetch } from './client';
import type { Pelicula, CrearPeliculaInput } from '../core/types/pelicula.types';

/** `GET /peliculas` — ruta pública (`@Public()`), no requiere sesión. Ver Backend/src/modules/peliculas/peliculas.controller.ts. */
export function listarPeliculas(token?: string | null): Promise<Pelicula[]> {
  return apiFetch<Pelicula[]>('/peliculas', { token });
}

/** `POST /peliculas` — solo administrador. */
export function crearPelicula(input: CrearPeliculaInput, token: string): Promise<Pelicula> {
  return apiFetch<Pelicula>('/peliculas', { method: 'POST', body: input, token });
}

/** `PATCH /peliculas/:id` — solo administrador. */
export function actualizarPelicula(idPelicula: number, input: CrearPeliculaInput, token: string): Promise<Pelicula> {
  return apiFetch<Pelicula>(`/peliculas/${idPelicula}`, { method: 'PATCH', body: input, token });
}

/** `DELETE /peliculas/:id` — solo administrador. Soft delete (estado='inactiva'), rechaza con 409 si hay funciones futuras programadas. */
export function eliminarPelicula(idPelicula: number, token: string): Promise<void> {
  return apiFetch<void>(`/peliculas/${idPelicula}`, { method: 'DELETE', token });
}
