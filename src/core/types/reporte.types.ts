/** Misma forma que `Backend/src/modules/reportes/reportes.service.ts` (RF08). */
export interface RangoFechas {
  /** ISO `YYYY-MM-DD`, inclusiva. */
  desde?: string;
  /** ISO `YYYY-MM-DD`, inclusiva. */
  hasta?: string;
  /** Si true, incluye estados no pagados. Default: false (solo pagada). */
  incluirNoPagadas?: boolean;
  /** Agrupación temporal para serie: 'dia' | 'semana' | 'mes'. Default: 'dia'. */
  agrupacion?: 'dia' | 'semana' | 'mes';
  /** Límite de resultados por página. */
  limit?: number;
  /** Offset para paginación. */
  offset?: number;
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

export interface ReportePorMetodoPago {
  metodoPago: string;
  totalVentas: number;
  montoTotal: string;
}

export interface ReportePorPromocion {
  idPromocion: number;
  nombre: string;
  tipoDescuento: string;
  totalVentas: number;
  montoDescuento: string;
}

export interface SerieTemporalPunto {
  fecha: string;
  montoTotal: string;
  cantidadEntradas: number;
  totalVentas: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
