import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { cineReducer, initialState, CineState, CineAction } from './cine.reducer';
import { leerEstadoSesion, guardarEstadoSesion } from '../core/sessionState';

const SESSION_KEY = 'lumen_cine_state';

interface CineContextProps {
  state: CineState;
  dispatch: React.Dispatch<CineAction>;
}

const CineContext = createContext<CineContextProps | undefined>(undefined);

export const CineProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cineReducer, initialState, (inicial) =>
    leerEstadoSesion(SESSION_KEY, inicial),
  );

  // Un F5 en medio de una compra (asientos elegidos, paso actual, carrito de
  // dulcería) antes tiraba al cliente de vuelta a /cartelera porque todo esto
  // vivía solo en memoria — ver ProcesoCompra.tsx, `if (!state.peliculaSeleccionada)
  // return <Navigate to="/cartelera" />`. Con esto sobrevive al refresh; sigue
  // sin sobrevivir a cerrar la pestaña/navegador (sessionStorage), que es lo
  // esperable acá.
  useEffect(() => {
    guardarEstadoSesion(SESSION_KEY, state);
  }, [state]);

  return (
    <CineContext.Provider value={{ state, dispatch }}>
      {children}
    </CineContext.Provider>
  );
};

export const useCine = () => {
  const context = useContext(CineContext);
  if (!context) {
    throw new Error('useCine debe ser usado dentro de un CineProvider');
  }
  return context;
};
