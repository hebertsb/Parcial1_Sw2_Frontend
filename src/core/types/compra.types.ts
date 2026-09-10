export interface Butaca {
  /** Clave local para React/comparación en TOGGLE_BUTACA (ej. "A1" = fila+numero). */
  id: string;
  /** `idAsiento` real del backend — lo que efectivamente viaja en `POST /ventas`. */
  idAsiento: number;
  fila: string;
  columna: number;
  estado: 'disponible' | 'ocupada' | 'seleccionada';
  /** Precio real de la función (`GET /precios/:id`, ver SeleccionButacas.tsx) — 0 solo si la función no tiene precio asignado, ahí el total recién se sabe al confirmar (`POST /ventas`). */
  precio: number;
}

export interface ItemCandyBar {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
}

export interface ItemCandyBarSeleccionado extends ItemCandyBar {
  cantidad: number;
}

export type EstadoCompra = 'seleccionando_asientos' | 'seleccionando_candybar' | 'pago' | 'completado';

export interface DatosTicket {
  peliculaId: string;
  horario: string;
  butacas: Butaca[];
  candyBar: ItemCandyBarSeleccionado[];
  total: number;
}
