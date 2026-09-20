import { apiFetch } from './client';
import type {
  RangoFechas,
  ResumenVentas,
  ReportePorPelicula,
  ReportePorFuncion,
  ReportePorProducto,
  DashboardResponse,
} from '../core/types/reporte.types';

function queryDeRango(filtro: RangoFechas): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set('desde', filtro.desde);
  if (filtro.hasta) params.set('hasta', filtro.hasta);
  if (filtro.incluirNoPagadas) params.set('incluirNoPagadas', 'true');
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

/** `GET /reportes/por-producto` — dulcería (CU09/RF20). */
export function obtenerReportePorProducto(filtro: RangoFechas, token: string): Promise<ReportePorProducto[]> {
  return apiFetch<ReportePorProducto[]>(`/reportes/por-producto${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/dashboard` — KPIs con variación vs periodo anterior. */
export function obtenerDashboard(filtro: RangoFechas, token: string): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/reportes/dashboard${queryDeRango(filtro)}`, { token });
}
