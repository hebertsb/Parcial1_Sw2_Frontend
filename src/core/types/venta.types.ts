export type TipoRegistroVenta = 'voz' | 'manual';

export type EstadoVenta =
  | 'pendiente'
  | 'confirmada'
  | 'pendiente_pago'
  | 'pagada'
  | 'anulada'
  | 'cancelada';

/** Mismo dominio que `pagos.metodo_pago` en el backend — `stripe`/`qr` reservados para más adelante. */
export type MetodoPago = 'stripe' | 'qr' | 'efectivo' | 'tarjeta';

/** Body de `POST /ventas` — misma forma que `CrearVentaInput` en el backend. */
export interface CrearVentaInput {
  idFuncion: number;
  idAsientos: number[];
  tipoRegistro: TipoRegistroVenta;
  /** RF03 — obligatorio en true para que la venta pueda crearse. */
  confirmacionNoReembolso: boolean;
  /** RF19 — obligatorio en true cuando tipoRegistro === 'voz'. */
  confirmacionVerbalCheck: boolean;
}

/** Respuesta de `POST /ventas` — misma forma que `venta.entity.ts` en el backend. Los montos vienen como string (numeric de Postgres). */
export interface Venta {
  idVenta: number;
  idUsuarioCliente: number | null;
  idFuncion: number;
  idPromocion: number | null;
  fechaHora: string;
  subtotal: string;
  descuentoAplicado: string;
  total: string;
  confirmacionNoReembolso: boolean;
  confirmacionVerbalCheck: boolean;
  tipoRegistro: TipoRegistroVenta;
  estado: EstadoVenta;
  metodoPagoElegido: MetodoPago | null;
  fechaPago: string | null;
  idPagoActivo: number | null;
}
