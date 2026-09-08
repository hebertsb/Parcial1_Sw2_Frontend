import { Pelicula } from '../core/types/pelicula.types';
import { Butaca, ItemCandyBarSeleccionado, EstadoCompra, DatosTicket } from '../core/types/compra.types';

export interface CineState {
  peliculas: Pelicula[];
  peliculaSeleccionada: Pelicula | null;
  horarioSeleccionado: string | null;
  butacasSeleccionadas: Butaca[];
  candyBarSeleccionado: ItemCandyBarSeleccionado[];
  estadoCompra: EstadoCompra;
}

export type CineAction =
  | { type: 'SET_PELICULAS'; payload: Pelicula[] }
  | { type: 'SELECCIONAR_PELICULA'; payload: { pelicula: Pelicula; horario: string } }
  | { type: 'TOGGLE_BUTACA'; payload: Butaca }
  | { type: 'ACTUALIZAR_CANDYBAR'; payload: ItemCandyBarSeleccionado }
  | { type: 'SET_ESTADO_COMPRA'; payload: EstadoCompra }
  | { type: 'RESETEAR_COMPRA' };

export const initialState: CineState = {
  peliculas: [],
  peliculaSeleccionada: null,
  horarioSeleccionado: null,
  butacasSeleccionadas: [],
  candyBarSeleccionado: [],
  estadoCompra: 'seleccionando_asientos'
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
        butacasSeleccionadas: [],
        candyBarSeleccionado: [],
        estadoCompra: 'seleccionando_asientos'
      };
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
    case 'RESETEAR_COMPRA':
      return {
        ...state,
        peliculaSeleccionada: null,
        horarioSeleccionado: null,
        butacasSeleccionadas: [],
        candyBarSeleccionado: [],
        estadoCompra: 'seleccionando_asientos'
      };
    default:
      return state;
  }
};
