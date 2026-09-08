export interface Butaca {
  id: string;
  fila: string;
  columna: number;
  estado: 'disponible' | 'ocupada' | 'seleccionada';
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
