import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { cineReducer, initialState, CineState, CineAction } from './cine.reducer';

interface CineContextProps {
  state: CineState;
  dispatch: React.Dispatch<CineAction>;
}

const CineContext = createContext<CineContextProps | undefined>(undefined);

export const CineProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cineReducer, initialState);

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
