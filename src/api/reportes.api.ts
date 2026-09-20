import { apiFetch } from './client';
import type {
  RangoFechas,
  ResumenVentas,
  ReportePorPelicula,
  ReportePorFuncion,
  ReportePorProducto,
  ReportePorMetodoPago,
  ReportePorPromocion,
  DashboardResponse,
  SerieTemporalPunto,
  PaginatedResponse,
} from '../core/types/reporte.types';

function queryDeRango(filtro: RangoFechas): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set('desde', filtro.desde);
  if (filtro.hasta) params.set('hasta', filtro.hasta);
  if (filtro.incluirNoPagadas) params.set('incluirNoPagadas', 'true');
  if (filtro.agrupacion) params.set('agrupacion', filtro.agrupacion);
  if (filtro.limit) params.set('limit', String(filtro.limit));
  if (filtro.offset) params.set('offset', String(filtro.offset));
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

export function obtenerReportePorPeliculaPaginado(filtro: RangoFechas, token: string): Promise<PaginatedResponse<ReportePorPelicula>> {
  return apiFetch<PaginatedResponse<ReportePorPelicula>>(`/reportes/por-pelicula/paginado${queryDeRango(filtro)}`, { token });
}

export function obtenerReportePorFuncion(filtro: RangoFechas, token: string): Promise<ReportePorFuncion[]> {
  return apiFetch<ReportePorFuncion[]>(`/reportes/por-funcion${queryDeRango(filtro)}`, { token });
}

export function obtenerReportePorFuncionPaginado(filtro: RangoFechas, token: string): Promise<PaginatedResponse<ReportePorFuncion>> {
  return apiFetch<PaginatedResponse<ReportePorFuncion>>(`/reportes/por-funcion/paginado${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/por-producto` — dulcería (CU09/RF20). */
export function obtenerReportePorProducto(filtro: RangoFechas, token: string): Promise<ReportePorProducto[]> {
  return apiFetch<ReportePorProducto[]>(`/reportes/por-producto${queryDeRango(filtro)}`, { token });
}

export function obtenerReportePorProductoPaginado(filtro: RangoFechas, token: string): Promise<PaginatedResponse<ReportePorProducto>> {
  return apiFetch<PaginatedResponse<ReportePorProducto>>(`/reportes/por-producto/paginado${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/por-metodo-pago` — ventas por método de pago (efectivo/tarjeta/stripe). */
export function obtenerReportePorMetodoPago(filtro: RangoFechas, token: string): Promise<ReportePorMetodoPago[]> {
  return apiFetch<ReportePorMetodoPago[]>(`/reportes/por-metodo-pago${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/por-promocion` — ventas por promoción aplicada. */
export function obtenerReportePorPromocion(filtro: RangoFechas, token: string): Promise<ReportePorPromocion[]> {
  return apiFetch<ReportePorPromocion[]>(`/reportes/por-promocion${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/dashboard` — KPIs con variación vs periodo anterior. */
export function obtenerDashboard(filtro: RangoFechas, token: string): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/reportes/dashboard${queryDeRango(filtro)}`, { token });
}

/** `GET /reportes/serie-temporal` — serie temporal para gráficos. */
export function obtenerSerieTemporal(filtro: RangoFechas, token: string): Promise<SerieTemporalPunto[]> {
  return apiFetch<SerieTemporalPunto[]>(`/reportes/serie-temporal${queryDeRango(filtro)}`, { token });
}
