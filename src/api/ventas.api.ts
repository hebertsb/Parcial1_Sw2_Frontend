import { apiFetch } from './client';
import type { CrearVentaInput, Venta } from '../core/types/venta.types';

/** `POST /ventas` — requiere JWT; crea la venta dentro de una transacción que marca los asientos como ocupados (ver Backend/src/modules/ventas/ventas.service.ts). */
export function crearVenta(input: CrearVentaInput, token: string): Promise<Venta> {
  return apiFetch<Venta>('/ventas', { method: 'POST', body: input, token });
}
