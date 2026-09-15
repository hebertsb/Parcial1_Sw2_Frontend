/** Misma forma que `Backend/src/database/entities/precio.entity.ts`. `valor` viaja como string (numeric de Postgres). */
export interface Precio {
  idPrecio: number;
  valor: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
}

/** Body de `POST /precios` / `PATCH /precios/:id` — misma forma que `CrearPrecioDto` del backend. `valor` viaja como number acá (el backend lo convierte a string). */
export interface CrearPrecioInput {
  valor: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}
