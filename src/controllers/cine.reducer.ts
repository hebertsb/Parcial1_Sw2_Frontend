import { Pelicula } from '../core/types/pelicula.types';
import { Butaca, ItemCandyBarSeleccionado, EstadoCompra } from '../core/types/compra.types';
import { Funcion, AsientoDisponibilidad } from '../core/types/funcion.types';
import { Sala } from '../core/types/sala.types';
import { Venta } from '../core/types/venta.types';

export interface CineState {
  peliculas: Pelicula[];
  peliculaSeleccionada: Pelicula | null;
  horarioSeleccionado: string | null;
  /** Función real elegida para la película actual — null hasta que se resuelve contra el backend (ver ProcesoCompra.tsx). */
  funcionSeleccionada: Funcion | null;
  /** Sala real de la función elegida (`GET /salas/:id`) — null hasta resolverla. Ver ProcesoCompra.tsx y Layout.tsx. */
  salaSeleccionada: Sala | null;
  /** Disponibilidad real de `GET /funciones/:id/disponibilidad`, lista plana ordenada por fila/número. */
  disponibilidad: AsientoDisponibilidad[];
  cargandoDisponibilidad: boolean;
  /** Precio real por entrada de la función seleccionada (`Precio.valor`, string numeric) — null hasta resolverlo. Ver ProcesoCompra.tsx. */
  precioUnitario: string | null;
  butacasSeleccionadas: Butaca[];
  candyBarSeleccionado: ItemCandyBarSeleccionado[];
  estadoCompra: EstadoCompra;
  /** La venta ya creada por `POST /ventas` — su `total` real reemplaza cualquier cálculo local en la vista de confirmación. */
  ventaCreada: Venta | null;
}

export type CineAction =
  | { type: 'SET_PELICULAS'; payload: Pelicula[] }
  | { type: 'SELECCIONAR_PELICULA'; payload: { pelicula: Pelicula; horario: string } }
  | { type: 'SET_FUNCION_SELECCIONADA'; payload: Funcion | null }
  | { type: 'SET_SALA_SELECCIONADA'; payload: Sala | null }
  | { type: 'SET_DISPONIBILIDAD'; payload: AsientoDisponibilidad[] }
  | { type: 'SET_CARGANDO_DISPONIBILIDAD'; payload: boolean }
  | { type: 'SET_PRECIO_UNITARIO'; payload: string | null }
  | { type: 'TOGGLE_BUTACA'; payload: Butaca }
  | { type: 'ACTUALIZAR_CANDYBAR'; payload: ItemCandyBarSeleccionado }
  | { type: 'SET_ESTADO_COMPRA'; payload: EstadoCompra }
  | { type: 'SET_VENTA_CREADA'; payload: Venta }
  | { type: 'RESETEAR_COMPRA' };

export const initialState: CineState = {
  peliculas: [],
  peliculaSeleccionada: null,
  horarioSeleccionado: null,
  funcionSeleccionada: null,
  salaSeleccionada: null,
  disponibilidad: [],
  cargandoDisponibilidad: false,
  precioUnitario: null,
  butacasSeleccionadas: [],
  candyBarSeleccionado: [],
  estadoCompra: 'seleccionando_asientos',
  ventaCreada: null
};

export const cineReducer = (state: CineState, action: CineAction): CineState => {
  switch (action.type) {
    case 'SET_PELICULAS':
      return { ...state, peliculas: action.payload };
    case 'SELECCIONAR_PELICULA':
      return {
        ...state,
        peliculaSeleccionada: action.payload.pelicula,
        horarioSeleccionado: action.payload.horario,
        funcionSeleccionada: null,
        salaSeleccionada: null,
        disponibilidad: [],
        precioUnitario: null,
        butacasSeleccionadas: [],
        candyBarSeleccionado: [],
        estadoCompra: 'seleccionando_asientos',
        ventaCreada: null
      };
    case 'SET_FUNCION_SELECCIONADA':
      return { ...state, funcionSeleccionada: action.payload };
    case 'SET_SALA_SELECCIONADA':
      return { ...state, salaSeleccionada: action.payload };
    case 'SET_DISPONIBILIDAD':
      return { ...state, disponibilidad: action.payload };
    case 'SET_CARGANDO_DISPONIBILIDAD':
      return { ...state, cargandoDisponibilidad: action.payload };
    case 'SET_PRECIO_UNITARIO':
      return { ...state, precioUnitario: action.payload };
    case 'TOGGLE_BUTACA':
      const isSelected = state.butacasSeleccionadas.find(b => b.id === action.payload.id);
      return {
        ...state,
        butacasSeleccionadas: isSelected
          ? state.butacasSeleccionadas.filter(b => b.id !== action.payload.id)
          : [...state.butacasSeleccionadas, action.payload]
      };
    case 'ACTUALIZAR_CANDYBAR':
      const existingItem = state.candyBarSeleccionado.find(i => i.id === action.payload.id);
      let updatedCandyBar = [...state.candyBarSeleccionado];
      if (existingItem) {
        if (action.payload.cantidad === 0) {
          updatedCandyBar = updatedCandyBar.filter(i => i.id !== action.payload.id);
        } else {
          updatedCandyBar = updatedCandyBar.map(i => i.id === action.payload.id ? action.payload : i);
        }
      } else if (action.payload.cantidad > 0) {
        updatedCandyBar.push(action.payload);
      }
      return { ...state, candyBarSeleccionado: updatedCandyBar };
    case 'SET_ESTADO_COMPRA':
      return { ...state, estadoCompra: action.payload };
    case 'SET_VENTA_CREADA':
      return { ...state, ventaCreada: action.payload };
    case 'RESETEAR_COMPRA':
      return {
        ...state,
        peliculaSeleccionada: null,
        horarioSeleccionado: null,
        funcionSeleccionada: null,
        salaSeleccionada: null,
        disponibilidad: [],
        precioUnitario: null,
        butacasSeleccionadas: [],
        candyBarSeleccionado: [],
        estadoCompra: 'seleccionando_asientos',
        ventaCreada: null
      };
    default:
      return state;
  }
};
