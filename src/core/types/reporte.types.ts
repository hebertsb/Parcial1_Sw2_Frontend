/** Misma forma que `Backend/src/modules/reportes/reportes.service.ts` (RF08). */
export interface RangoFechas {
  /** ISO `YYYY-MM-DD`, inclusiva. */
  desde?: string;
  /** ISO `YYYY-MM-DD`, inclusiva. */
  hasta?: string;
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
