import type { Venta } from './venta.types';

/** Mismo dominio que `pagos.estado` en el backend. */
export type EstadoPago = 'pendiente' | 'procesando' | 'exitoso' | 'fallido' | 'reembolsado' | 'cancelado';

/** `GET /pagos/config` (público): si el pago con tarjeta está disponible y la clave PUBLICABLE de Stripe (la secreta nunca sale del backend). */
export interface ConfiguracionPagos {
  stripe: { habilitado: boolean; clavePublicable: string; moneda: string };
}

/** `POST /pagos/stripe/iniciar`: el `clientSecret` es lo único que necesita el formulario de Stripe para confirmar el pago. */
export interface IniciarPagoStripe {
  idPago: number;
  idVenta: number;
  clientSecret: string;
  /** Monto y moneda REALES del cobro (puede ser distinta de bolivianos si el backend cobra en dólares). */
  monto: string;
  moneda: string;
}

/** `POST /pagos/:idPago/verificar`: el servidor le pregunta a Stripe cómo quedó el cobro; `venta.estado === 'pagada'` solo si Stripe lo confirmó. */
export interface VerificacionPago {
  estado: EstadoPago;
  venta: Venta;
  mensaje: string | null;
}

// --------------------------------------------------------------------------- formulario de tarjeta guiado por voz

/** Los tres campos del formulario de tarjeta de Stripe, en el orden en que se piden. */
export type CampoTarjeta = 'numero' | 'vencimiento' | 'cvc';
export const CAMPOS_TARJETA: readonly CampoTarjeta[] = ['numero', 'vencimiento', 'cvc'];

/** Estado de UN campo. Nunca lleva lo escrito: los datos de la tarjeta viven solo dentro de los iframes de Stripe. */
export interface EstadoCampoTarjeta {
  completo: boolean;
  vacio: boolean;
  /** Mensaje de Stripe (en español) cuando el dato es INVÁLIDO (no cuando solo está incompleto): es lo que el agente dice en voz alta. */
  error: string | null;
}

export type CamposTarjeta = Record<CampoTarjeta, EstadoCampoTarjeta>;

export const CAMPOS_VACIOS: CamposTarjeta = {
  numero: { completo: false, vacio: true, error: null },
  vencimiento: { completo: false, vacio: true, error: null },
  cvc: { completo: false, vacio: true, error: null },
};

/** Cómo terminó (o no) el intento de pago, que la pantalla le cuenta al agente para que lo diga. El agente NO lo da por bueno: lo verifica contra el backend. */
export type EventoPago = 'confirmado' | 'rechazado' | 'cancelado' | 'error';
