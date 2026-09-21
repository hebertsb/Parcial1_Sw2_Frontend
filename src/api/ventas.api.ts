import { apiFetch } from './client';
import type { CrearVentaInput, Venta, VentaConFuncion, VentaConDetalle } from '../core/types/venta.types';

/** `POST /ventas` — requiere JWT; crea la venta dentro de una transacción que marca los asientos como ocupados (ver Backend/src/modules/ventas/ventas.service.ts). */
export function crearVenta(input: CrearVentaInput, token: string): Promise<Venta> {
  return apiFetch<Venta>('/ventas', { method: 'POST', body: input, token });
}

/**
 * `GET /ventas/mis-compras` — SOLO las compras de la sesión (el id sale del JWT en el backend),
 * sea cliente o administrador. No se usa `GET /ventas` porque a un administrador le devuelve las
 * de todos. Usado por `MisCompras.tsx`.
 */
export function listarMisCompras(token: string): Promise<VentaConFuncion[]> {
  return apiFetch<VentaConFuncion[]>('/ventas/mis-compras', { token });
}

/**
 * `GET /ventas/:id` — detalle completo (asientos + dulcería). El backend responde
 * 403 si un `cliente` pide una venta que no es suya (ver `VentasController.buscarPorId`).
 */
export function obtenerVenta(idVenta: number, token: string): Promise<VentaConDetalle> {
  return apiFetch<VentaConDetalle>(`/ventas/${idVenta}`, { token });
}
