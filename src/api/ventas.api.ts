import { apiFetch } from './client';
import type { CrearVentaInput, Venta, VentaConFuncion, VentaConDetalle } from '../core/types/venta.types';

/** `POST /ventas` — requiere JWT; crea la venta dentro de una transacción que marca los asientos como ocupados (ver Backend/src/modules/ventas/ventas.service.ts). */
export function crearVenta(input: CrearVentaInput, token: string): Promise<Venta> {
  return apiFetch<Venta>('/ventas', { method: 'POST', body: input, token });
}

/**
 * `GET /ventas` — el backend ya filtra por rol (RF11): un `cliente` solo ve las
 * propias, sin que haga falta mandar ningún filtro acá. Usado por `MisCompras.tsx`.
 */
export function listarMisCompras(token: string): Promise<VentaConFuncion[]> {
  return apiFetch<VentaConFuncion[]>('/ventas', { token });
}

/**
 * `GET /ventas/:id` — detalle completo (asientos + dulcería). El backend responde
 * 403 si un `cliente` pide una venta que no es suya (ver `VentasController.buscarPorId`).
 */
export function obtenerVenta(idVenta: number, token: string): Promise<VentaConDetalle> {
  return apiFetch<VentaConDetalle>(`/ventas/${idVenta}`, { token });
}
