export type TipoDescuento = 'porcentaje' | 'monto_fijo';

/** Misma forma que `Backend/src/database/entities/promocion.entity.ts`. `valor` viaja como string (numeric de Postgres). */
export interface Promocion {
  idPromocion: number;
  nombre: string;
  descripcion: string | null;
  tipoDescuento: TipoDescuento;
  valor: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

/** Body de `POST /promociones` — misma forma que `CrearPromocionDto`. No incluye `activa` (nace en `true`). */
export interface CrearPromocionInput {
  nombre: string;
  descripcion?: string;
  tipoDescuento: TipoDescuento;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
}

/** Body de `PATCH /promociones/:id` — misma forma que `ActualizarPromocionDto`, agrega `activa` para el toggle. */
export interface ActualizarPromocionInput extends Partial<CrearPromocionInput> {
  activa?: boolean;
}
