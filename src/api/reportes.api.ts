import { apiFetch } from './client';
import type { RangoFechas, ResumenVentas, ReportePorPelicula, ReportePorFuncion } from '../core/types/reporte.types';

function queryDeRango(filtro: RangoFechas): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set('desde', filtro.desde);
  if (filtro.hasta) params.set('hasta', filtro.hasta);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** `GET /reportes/ventas` — solo administrador (RF08), ver Backend/src/modules/reportes/reportes.controller.ts. */
export function obtenerResumenVentas(filtro: RangoFechas, token: string): Promise<ResumenVentas> {
  return apiFetch<ResumenVentas>(`/reportes/ventas${queryDeRango(filtro)}`, { token });
}

export function obtenerReportePorPelicula(filtro: RangoFechas, token: string): Promise<ReportePorPelicula[]> {
  return apiFetch<ReportePorPelicula[]>(`/reportes/por-pelicula${queryDeRango(filtro)}`, { token });
}

export function obtenerReportePorFuncion(filtro: RangoFechas, token: string): Promise<ReportePorFuncion[]> {
  return apiFetch<ReportePorFuncion[]>(`/reportes/por-funcion${queryDeRango(filtro)}`, { token });
}
