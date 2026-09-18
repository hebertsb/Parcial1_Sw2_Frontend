/** Misma forma que `Backend/src/database/entities/categoria-dulceria.entity.ts`. */
export interface CategoriaDulceria {
  idCategoria: number;
  nombre: string;
  ordenVisualizacion: number;
  icono: string | null;
}

/** Body de `POST /dulceria/categorias` / `PATCH /dulceria/categorias/:id` — misma forma que `CrearCategoriaDto` del backend. */
export interface CrearCategoriaInput {
  nombre: string;
  ordenVisualizacion?: number;
  icono?: string;
}

export type TipoProductoDulceria = 'individual' | 'combo';

/** Misma forma que `Backend/src/database/entities/producto-dulceria.entity.ts`. `precioBase` viaja como string (numeric de Postgres). */
export interface ProductoDulceria {
  idProducto: number;
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  precioBase: string;
  tipo: TipoProductoDulceria;
  etiqueta: string | null;
  disponible: boolean;
  /** URL de Cloudinary (2026-09-16), mismo mecanismo que `Pelicula.posterUrl`. */
  imagenUrl: string | null;
}

/**
 * Body de `POST /dulceria/productos` — misma forma que `CrearProductoDto` del
 * backend. `precioBase` viaja como number acá (el backend lo convierte a string).
 */
export interface CrearProductoInput {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  tipo?: TipoProductoDulceria;
  etiqueta?: string;
  imagenUrl?: string;
}

/**
 * Body de `PATCH /dulceria/productos/:id` — mismos campos que `CrearProductoInput`
 * más `disponible`, el flag de soft-delete que expone `ActualizarProductoDto`.
 */
export interface ActualizarProductoInput extends Partial<CrearProductoInput> {
  disponible?: boolean;
}
