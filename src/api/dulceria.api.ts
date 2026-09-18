import { apiFetch } from './client';
import type {
  CategoriaDulceria,
  CrearCategoriaInput,
  ProductoDulceria,
  CrearProductoInput,
  ActualizarProductoInput,
} from '../core/types/dulceria.types';

/**
 * `Backend/src/modules/dulceria/dulceria.controller.ts`: lectura requiere JWT
 * (cualquier rol, sin `@Public()`) pero no restringe por rol; escritura es
 * `@Roles('administrador')`. Mismo patrón que `precios.api.ts`.
 */

// ---- Categorías -------------------------------------------------------------

export function listarCategoriasDulceria(token?: string | null): Promise<CategoriaDulceria[]> {
  return apiFetch<CategoriaDulceria[]>('/dulceria/categorias', { token });
}

export function obtenerCategoriaDulceria(
  idCategoria: number,
  token?: string | null,
): Promise<CategoriaDulceria> {
  return apiFetch<CategoriaDulceria>(`/dulceria/categorias/${idCategoria}`, { token });
}

/** `POST /dulceria/categorias` — solo administrador. */
export function crearCategoriaDulceria(
  input: CrearCategoriaInput,
  token: string,
): Promise<CategoriaDulceria> {
  return apiFetch<CategoriaDulceria>('/dulceria/categorias', { method: 'POST', body: input, token });
}

/** `PATCH /dulceria/categorias/:id` — solo administrador. */
export function actualizarCategoriaDulceria(
  idCategoria: number,
  input: Partial<CrearCategoriaInput>,
  token: string,
): Promise<CategoriaDulceria> {
  return apiFetch<CategoriaDulceria>(`/dulceria/categorias/${idCategoria}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

/** `DELETE /dulceria/categorias/:id` — solo administrador. DELETE físico; rechaza con 409 si hay productos asociados. */
export function eliminarCategoriaDulceria(idCategoria: number, token: string): Promise<void> {
  return apiFetch<void>(`/dulceria/categorias/${idCategoria}`, { method: 'DELETE', token });
}

// ---- Productos ----------------------------------------------------------------

/**
 * Trae TODOS los productos (disponibles o no) — el backend no filtra acá, ver
 * `DulceriaService.listarProductos`. Para la vitrina de compra del cliente,
 * filtrar `disponible === true` del lado del frontend.
 */
export function listarProductosDulceria(token?: string | null): Promise<ProductoDulceria[]> {
  return apiFetch<ProductoDulceria[]>('/dulceria/productos', { token });
}

export function obtenerProductoDulceria(
  idProducto: number,
  token?: string | null,
): Promise<ProductoDulceria> {
  return apiFetch<ProductoDulceria>(`/dulceria/productos/${idProducto}`, { token });
}

/** `POST /dulceria/productos` — solo administrador. */
export function crearProductoDulceria(
  input: CrearProductoInput,
  token: string,
): Promise<ProductoDulceria> {
  return apiFetch<ProductoDulceria>('/dulceria/productos', { method: 'POST', body: input, token });
}

/** `PATCH /dulceria/productos/:id` — solo administrador. */
export function actualizarProductoDulceria(
  idProducto: number,
  input: ActualizarProductoInput,
  token: string,
): Promise<ProductoDulceria> {
  return apiFetch<ProductoDulceria>(`/dulceria/productos/${idProducto}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

/** `DELETE /dulceria/productos/:id` — solo administrador. Soft delete (`disponible=false`), responde 204. */
export function eliminarProductoDulceria(idProducto: number, token: string): Promise<void> {
  return apiFetch<void>(`/dulceria/productos/${idProducto}`, { method: 'DELETE', token });
}
