/** Misma forma que `Backend/src/database/entities/precio.entity.ts`. `valor` viaja como string (numeric de Postgres). */
export interface Precio {
  idPrecio: number;
  valor: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
}
