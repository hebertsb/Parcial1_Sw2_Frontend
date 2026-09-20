import { apiFetch } from './client';
import type { Venta, MetodoPago } from '../core/types/venta.types';
import type { ConfiguracionPagos, IniciarPagoStripe, VerificacionPago } from '../core/types/pago.types';

/**
 * `POST /pagos` — requiere JWT. Efectivo (o tarjeta física, que solo registra la caja): el sistema lo confirma al instante y devuelve la
 * venta ya con `estado='pagada'`. Un cliente solo puede pagar SUS ventas. La tarjeta en línea NO va por acá: ver `iniciarPagoStripe`.
 */
export function crearPago(idVenta: number, metodo: MetodoPago, token: string): Promise<Venta> {
  return apiFetch<Venta>('/pagos', { method: 'POST', body: { idVenta, metodo }, token });
}

/** `GET /pagos/config` — público. Dice si el pago con tarjeta está disponible y con qué clave publicable de Stripe. */
export function obtenerConfiguracionPagos(): Promise<ConfiguracionPagos> {
  return apiFetch<ConfiguracionPagos>('/pagos/config');
}

/** `POST /pagos/stripe/iniciar` — abre (o retoma) el cobro con tarjeta de una venta pendiente y devuelve el `clientSecret` del formulario de Stripe. */
export function iniciarPagoStripe(idVenta: number, token: string): Promise<IniciarPagoStripe> {
  return apiFetch<IniciarPagoStripe>('/pagos/stripe/iniciar', { method: 'POST', body: { idVenta }, token });
}

/**
 * `POST /pagos/:idPago/verificar` — se llama después de confirmar la tarjeta: el SERVIDOR consulta a Stripe y devuelve la venta como quedó.
 * Lo que diga el navegador no cuenta: la venta solo pasa a `pagada` si Stripe confirmó el cobro.
 */
export function verificarPagoStripe(idPago: number, token: string): Promise<VerificacionPago> {
  return apiFetch<VerificacionPago>(`/pagos/${idPago}/verificar`, { method: 'POST', token });
}

/** `POST /pagos/venta/:idVenta/cancelar` — cancela una venta que todavía no se pagó y libera sus asientos al instante. */
export function cancelarVentaPendiente(idVenta: number, token: string): Promise<Venta> {
  return apiFetch<Venta>(`/pagos/venta/${idVenta}/cancelar`, { method: 'POST', token });
}
