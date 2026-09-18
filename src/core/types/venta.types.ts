import type { Pelicula } from './pelicula.types';
import type { Sala } from './sala.types';
import type { Promocion } from './promocion.types';

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
  /** Dulcería del mismo carrito (CU09/RF20, 2026-09-16) — opcional, sin dulcería si se omite. */
  dulceria?: { idProducto: number; cantidad: number }[];
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

/** Misma forma que `Backend/src/database/entities/funcion.entity.ts`, con `pelicula`/`sala` anidadas por `relations` (ver `VentasService.listar`/`buscarPorId`). */
export interface FuncionDeVenta {
  idFuncion: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  pelicula: Pelicula;
  sala: Sala;
}

/**
 * `GET /ventas` (RF11 — un cliente solo ve las propias) devuelve esta forma:
 * la fila de `Venta` con `funcion` (+ película/sala) y `promocion` ya resueltas,
 * para no tener que pedir cada una aparte por venta. Ver `VentasService.listar`.
 */
export interface VentaConFuncion extends Venta {
  funcion: FuncionDeVenta;
  promocion: Promocion | null;
}

/** Misma forma que `Backend/src/database/entities/asiento.entity.ts`. */
export interface AsientoDeVenta {
  idAsiento: number;
  fila: string;
  numero: number;
}

export interface DetalleEntradaDeVenta {
  idDetalle: number;
  idAsiento: number;
  precioUnitario: string;
  asiento: AsientoDeVenta;
}

/** Solo los campos que necesita el ticket — misma forma parcial que `ProductoDulceria`. */
export interface ProductoDeVenta {
  idProducto: number;
  nombre: string;
  imagenUrl: string | null;
}

export interface DetalleDulceriaDeVenta {
  idDetalle: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: string;
  producto: ProductoDeVenta;
}

/**
 * `GET /ventas/:id` (RF04 — comprobante/entrada) devuelve esta forma: todo lo de
 * `VentaConFuncion` más el detalle asiento a asiento y de dulcería. Ver
 * `VentasService.buscarPorId`.
 */
export interface VentaConDetalle extends VentaConFuncion {
  detalleEntradas: DetalleEntradaDeVenta[];
  detalleDulceria: DetalleDulceriaDeVenta[];
}
