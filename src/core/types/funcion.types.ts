export type EstadoFuncion = 'programada' | 'cancelada';

/** Misma forma que `Backend/src/database/entities/funcion.entity.ts`. */
export interface Funcion {
  idFuncion: number;
  idPelicula: number;
  idSala: number;
  idPrecio: number | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tiempoLimpiezaMin: number | null;
  estado: EstadoFuncion;
}

/** Body de `POST /funciones` / `PATCH /funciones/:id` — misma forma que `CrearFuncionDto` del backend. */
export interface CrearFuncionInput {
  idPelicula: number;
  idSala: number;
  idPrecio?: number;
  /** ISO `YYYY-MM-DD`. */
  fecha: string;
  /** `HH:mm`. */
  horaInicio: string;
  /** `HH:mm`. */
  horaFin: string;
  tiempoLimpiezaMin?: number;
}

export type EstadoDisponibilidadAsiento = 'disponible' | 'ocupado' | 'cancelada';

/** Un elemento de la respuesta de `GET /funciones/:id/disponibilidad`. */
export interface AsientoDisponibilidad {
  idFuncion: number;
  idAsiento: number;
  asiento: {
    idAsiento: number;
    idSala: number;
    fila: string;
    numero: number;
  };
  estado: EstadoDisponibilidadAsiento;
}
