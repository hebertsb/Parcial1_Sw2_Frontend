import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { TipoVentana } from '../types/voice.types';

/**
 * Ventanas flotantes que el agente abre segun lo que se le pide (confirmacion de una accion, reporte, entrada digital).
 * Hay una por tipo: abrir de nuevo la misma reemplaza su contenido (ej. la confirmacion se actualiza si el usuario
 * corrige un dato). Se pueden arrastrar; la ultima que se toca queda arriba.
 */

export interface Ventana {
  tipo: TipoVentana;
  datos: Record<string, unknown>;
  x: number;
  y: number;
  z: number;
}

interface Ventanas {
  ventanas: Ventana[];
  abrir: (tipo: TipoVentana, datos: Record<string, unknown>) => void;
  cerrar: (tipo: TipoVentana) => void;
  cerrarTodas: () => void;
  enfocar: (tipo: TipoVentana) => void;
  mover: (tipo: TipoVentana, x: number, y: number) => void;
}

export const ANCHO_VENTANA: Record<TipoVentana, number> = { confirmacion: 440, reporte: 560, ticket: 400 };

/**
 * Borde de abajo del panel de voz (mas un margen) si esta a la vista, o 0. Las ventanas se abren DEBAJO: no deben tapar
 * el selector de modo ni lo que se esta diciendo. Como el panel es fijo, esta medida es la misma con o sin scroll.
 */
function topeDelPanelDeVoz(): number {
  if (typeof document === 'undefined') return 0;
  const panel = document.querySelector('[data-testid="voice-strip"]');
  return panel ? Math.round(panel.getBoundingClientRect().bottom + 12) : 0;
}

/** Donde aparece cada ventana la primera vez: escalonadas para que no se tapen entre si. */
function posicionInicial(tipo: TipoVentana): { x: number; y: number } {
  const ancho = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const w = ANCHO_VENTANA[tipo];
  const tope = topeDelPanelDeVoz();
  switch (tipo) {
    case 'confirmacion':
      return { x: Math.max(8, ancho - w - 32), y: Math.max(120, tope) };
    case 'reporte':
      return { x: Math.max(8, 32), y: Math.max(130, tope) };
    case 'ticket':
      return { x: Math.max(8, Math.round((ancho - w) / 2)), y: Math.max(96, tope) };
  }
}

const VentanasContext = createContext<Ventanas | undefined>(undefined);

export const VentanasProvider = ({ children }: { children: ReactNode }) => {
  const [ventanas, setVentanas] = useState<Ventana[]>([]);
  const zRef = useRef(80);

  const abrir = useCallback((tipo: TipoVentana, datos: Record<string, unknown>) => {
    zRef.current += 1;
    const z = zRef.current;
    setVentanas((actuales) => {
      const existente = actuales.find((v) => v.tipo === tipo);
      if (existente) return actuales.map((v) => (v.tipo === tipo ? { ...v, datos, z } : v));
      return [...actuales, { tipo, datos, z, ...posicionInicial(tipo) }];
    });
  }, []);

  const cerrar = useCallback((tipo: TipoVentana) => setVentanas((actuales) => actuales.filter((v) => v.tipo !== tipo)), []);
  const cerrarTodas = useCallback(() => setVentanas([]), []);

  const enfocar = useCallback((tipo: TipoVentana) => {
    zRef.current += 1;
    const z = zRef.current;
    setVentanas((actuales) => actuales.map((v) => (v.tipo === tipo ? { ...v, z } : v)));
  }, []);

  const mover = useCallback(
    (tipo: TipoVentana, x: number, y: number) => setVentanas((actuales) => actuales.map((v) => (v.tipo === tipo ? { ...v, x, y } : v))),
    [],
  );

  const value = useMemo(() => ({ ventanas, abrir, cerrar, cerrarTodas, enfocar, mover }), [ventanas, abrir, cerrar, cerrarTodas, enfocar, mover]);
  return <VentanasContext.Provider value={value}>{children}</VentanasContext.Provider>;
};

export const useVentanas = (): Ventanas => {
  const contexto = useContext(VentanasContext);
  if (!contexto) throw new Error('useVentanas debe usarse dentro de un VentanasProvider');
  return contexto;
};
