/** Misma forma que `Backend/src/database/entities/sala.entity.ts`. */
export interface Sala {
  idSala: number;
  nombre: string;
  capacidad: number;
  tipo: string | null;
  tiempoLimpiezaMin: number;
}

/** Body de `POST /salas` — misma forma que `CrearSalaDto`. `capacidad`/`asientosPorFila` solo existen acá: `ActualizarSalaDto` los prohíbe (cambiar la capacidad implicaría regenerar los asientos, fuera de alcance). */
export interface CrearSalaInput {
  nombre: string;
  capacidad: number;
  tipo?: string;
  tiempoLimpiezaMin?: number;
  asientosPorFila?: number;
}

/** Body de `PATCH /salas/:id` — misma forma que `ActualizarSalaDto`. */
export interface ActualizarSalaInput {
  nombre?: string;
  tipo?: string;
  tiempoLimpiezaMin?: number;
}
