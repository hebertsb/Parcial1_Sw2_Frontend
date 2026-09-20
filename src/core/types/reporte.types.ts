/** Misma forma que `Backend/src/modules/reportes/reportes.service.ts` (RF08). */
export interface RangoFechas {
  /** ISO `YYYY-MM-DD`, inclusiva. */
  desde?: string;
  /** ISO `YYYY-MM-DD`, inclusiva. */
  hasta?: string;
  /** Si true, incluye estados no pagados. Default: false (solo pagada). */
  incluirNoPagadas?: boolean;
}

export interface ResumenVentas {
  totalVentas: number;
  montoTotal: string;
  cantidadEntradas: number;
}

export interface ReportePorPelicula {
  idPelicula: number;
  titulo: string;
  totalVentas: number;
  montoTotal: string;
  cantidadEntradas: number;
}

export interface ReportePorFuncion {
  idFuncion: number;
  titulo: string;
  fecha: string;
  horaInicio: string;
  totalVentas: number;
  montoTotal: string;
  cantidadEntradas: number;
}

export interface ReportePorProducto {
  idProducto: number;
  nombre: string;
  cantidadVendida: number;
  montoTotal: string;
}

export interface DashboardMetrica {
  actual: number;
  anterior: number;
  variacionPorcentual: string;
}

export interface DashboardResponse {
  montoTotal: DashboardMetrica;
  totalVentas: DashboardMetrica;
  cantidadEntradas: DashboardMetrica;
}
