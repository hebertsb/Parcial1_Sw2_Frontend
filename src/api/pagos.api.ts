import { apiFetch } from './client';
import type { Venta, MetodoPago } from '../core/types/venta.types';

/** `POST /pagos` — requiere JWT; confirma el cobro (sin Stripe todavía, ver Backend/src/modules/pagos/pagos.service.ts) y devuelve la venta ya con `estado='pagada'`. */
export function crearPago(idVenta: number, metodo: MetodoPago, token: string): Promise<Venta> {
  return apiFetch<Venta>('/pagos', { method: 'POST', body: { idVenta, metodo }, token });
}
